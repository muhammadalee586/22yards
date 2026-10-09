from rest_framework import viewsets, status
from rest_framework.response import Response
from django.db import transaction
from django.db.models import Q, Avg, Count
from .models import Booking, Review
from .serializers import BookingSerializer, ReviewSerializer
from rest_framework.permissions import IsAuthenticated, AllowAny
from core.permissions import IsObjectOwnerOrAdmin, IsAdminRole
from rest_framework import serializers
from rest_framework.decorators import action
from decimal import Decimal
from datetime import datetime

class BookingViewSet(viewsets.ModelViewSet):
    """
    Handles court bookings, pricing calculations, and conflict checks.
    """
    queryset = Booking.objects.all()
    serializer_class = BookingSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if not user or not user.is_authenticated:
            return Booking.objects.none()

        view_type = self.request.query_params.get('view', 'all')
        now_date = datetime.now().date()

        # Base queryset based on role
        if getattr(user, 'role', None) == 'ADMIN':
            qs = Booking.objects.all()
        elif getattr(user, 'role', None) == 'OWNER':
            qs = Booking.objects.filter(Q(court__owner=user) | Q(user=user)).distinct()
        else:
            qs = Booking.objects.filter(user=user)

        if view_type == 'upcoming':
            # upcoming = (Confirmed/Pending) AND (Date >= today)
            return qs.filter(
                status__in=['CONFIRMED', 'PENDING'],
                date__gte=now_date
            )

        if view_type == 'history':
            # history = (Completed/Cancelled) OR (Date < today)
            return qs.filter(
                Q(status__in=['COMPLETED', 'CANCELLED']) | Q(date__lt=now_date)
            )

        return qs

    def perform_create(self, serializer):
        court = serializer.validated_data['court']
        start = serializer.validated_data['start_time']
        end = serializer.validated_data['end_time']
        booking_date = serializer.validated_data['date']
        end_date = serializer.validated_data.get('end_date') or booking_date

        # Auto-adjust overnight end_date if end_time <= start_time
        from datetime import timedelta
        if end <= start and end_date == booking_date:
            end_date = booking_date + timedelta(days=1)

        # Check operating days (for overnight post-midnight slots, session began previous evening)
        is_overnight = court.closing_time <= court.opening_time
        if is_overnight and start < court.closing_time:
            session_date = booking_date - timedelta(days=1)
        else:
            session_date = booking_date

        day_abbr = session_date.strftime('%a')[:3].upper() # e.g. MON, TUE, WED, THU, FRI, SAT, SUN
        court_days = court.operating_days or ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN']
        if day_abbr not in court_days:
            raise serializers.ValidationError(f"This court is closed on {session_date.strftime('%A')}s.")

        # 1. Calculate total price
        start_dt = datetime.combine(booking_date, start)
        end_dt = datetime.combine(end_date, end)
        duration_seconds = (end_dt - start_dt).total_seconds()
        hours = Decimal(duration_seconds) / Decimal(3600)
        total_price = (hours * court.price_per_hour).quantize(Decimal('0.01'))

        with transaction.atomic():
            # Lock court row to prevent race conditions
            court_locked = court.__class__.objects.select_for_update().get(pk=court.pk)

            # 2. Conflict check (excluding cancelled bookings)
            # A conflict exists if any booking overlaps on start_date or end_date

            conflicts = Booking.objects.filter(
                court=court_locked
            ).exclude(status='CANCELLED')

            has_overlap = False
            for b in conflicts:
                # Use the actual timestamps for comparison
                b_start = datetime.combine(b.date, b.start_time)
                b_end = datetime.combine(b.end_date or b.date, b.end_time)

                if start_dt < b_end and b_start < end_dt:
                    has_overlap = True
                    break

            if has_overlap:
                raise serializers.ValidationError("This time slot is already booked.")

            serializer.save(
                user=self.request.user,
                total_price=total_price,
                end_date=end_date
            )

    @action(detail=True, methods=['post'], permission_classes=[IsObjectOwnerOrAdmin])
    def cancel(self, request, pk=None):
        booking = self.get_object()
        if booking.status == 'CANCELLED':
            return Response({"detail": "Booking is already cancelled."}, status=status.HTTP_400_BAD_REQUEST)
        if booking.status == 'COMPLETED':
            return Response({"detail": "Cannot cancel a completed booking."}, status=status.HTTP_400_BAD_REQUEST)
        
        # Check if it hasn't started yet
        from django.utils import timezone
        local_now = timezone.localtime(timezone.now())
        today = local_now.date()
        now_time = local_now.time()
        if booking.date < today or (booking.date == today and booking.start_time <= now_time):
            return Response({"detail": "Cannot cancel a booking that has already started or passed."}, status=status.HTTP_400_BAD_REQUEST)
        
        booking.status = 'CANCELLED'
        booking.save()
        return Response({'status': 'Booking cancelled successfully.', 'booking_status': booking.status})

    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated])
    def complete(self, request, pk=None):
        # Special case: allow court owner to complete their own court's booking
        booking = self.get_object()
        user = request.user
        is_owner = getattr(user, 'role', None) == 'OWNER' and booking.court.owner == user
        is_admin = getattr(user, 'role', None) == 'ADMIN'

        if not (is_owner or is_admin):
            return Response({"detail": "Not authorized to complete this booking."}, status=status.HTTP_403_FORBIDDEN)

        booking.status = 'COMPLETED'
        booking.save()
        return Response({'status': 'Booking marked as COMPLETED.'})

class ReviewViewSet(viewsets.ModelViewSet):
    """
    Allows verified users to rate and review courts.
    """
    queryset = Review.objects.all()
    serializer_class = ReviewSerializer
    
    def get_queryset(self):
        queryset = Review.objects.all().order_by('-created_at')
        court_id = self.request.query_params.get('court')
        if court_id:
            queryset = queryset.filter(court_id=court_id)
        return queryset

    def get_permissions(self):
        if self.action in ['update', 'partial_update', 'destroy']:
            return [IsObjectOwnerOrAdmin()]
        if self.action == 'create':
            return [IsAuthenticated()]
        return [AllowAny()]

    def perform_create(self, serializer):
        court = serializer.validated_data['court']
        has_booked = Booking.objects.filter(
            user=self.request.user,
            court=court,
            status='COMPLETED'
        ).exists()

        if not has_booked:
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied("You can only review a court after completing a booking.")

        review = serializer.save(user=self.request.user)
        
        # Recalculate court ratings
        stats = Review.objects.filter(court=court).aggregate(
            avg=Avg('rating'),
            cnt=Count('id')
        )
        court.average_rating = stats['avg'] or 0.00
        court.total_reviews = stats['cnt'] or 0
        court.save()
