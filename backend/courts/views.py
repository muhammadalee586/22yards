from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated, AllowAny
from django.db.models import Q
from .models import Court, CourtImage
from .serializers import CourtSerializer, CourtImageSerializer
from core.permissions import IsOwnerRoleOrReadOnly, IsObjectOwnerOrAdmin

class CourtViewSet(viewsets.ModelViewSet):
    """
    API endpoint that allows courts to be viewed, created, edited, and deleted.
    """
    queryset = Court.objects.all()
    serializer_class = CourtSerializer

    def get_permissions(self):
        if self.action == 'create':
            return [IsOwnerRoleOrReadOnly()]
        if self.action in ['update', 'partial_update', 'destroy']:
            return [IsObjectOwnerOrAdmin()]
        return [AllowAny()]

    def get_queryset(self):
        queryset = Court.objects.all()

        # Filter by city
        city = self.request.query_params.get('city')
        if city:
            queryset = queryset.filter(city__icontains=city)

        # Filter by search (name, description, address)
        search = self.request.query_params.get('search')
        if search:
            queryset = queryset.filter(
                Q(name__icontains=search) |
                Q(description__icontains=search) |
                Q(address__icontains=search)
            )

        # Filter by turf type
        turf_type = self.request.query_params.get('turf_type')
        if turf_type:
            queryset = queryset.filter(turf_type=turf_type)

        # Filter by AC availability
        has_ac = self.request.query_params.get('has_ac')
        if has_ac:
            queryset = queryset.filter(has_ac=has_ac.lower() == 'true')

        # Filter by parking availability
        has_parking = self.request.query_params.get('has_parking')
        if has_parking:
            queryset = queryset.filter(has_parking=has_parking.lower() == 'true')

        return queryset

    def perform_create(self, serializer):
        # Automatically assign the current user as the owner
        serializer.save(owner=self.request.user)

    @action(detail=True, methods=['post'], permission_classes=[IsObjectOwnerOrAdmin])
    def add_image(self, request, pk=None):
        court = self.get_object()
        serializer = CourtImageSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(court=court)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=['get'], permission_classes=[AllowAny])
    def availability(self, request, pk=None):
        court = self.get_object()
        date_str = request.query_params.get('date')
        if not date_str:
            return Response({"detail": "date query parameter is required (YYYY-MM-DD)"}, status=status.HTTP_400_BAD_REQUEST)

        from datetime import datetime, timedelta
        try:
            req_date = datetime.strptime(date_str, '%Y-%m-%d').date()
            next_date = req_date + timedelta(days=1)
            prev_date = req_date - timedelta(days=1)
        except ValueError:
            return Response({"detail": "Invalid date format. Use YYYY-MM-DD."}, status=status.HTTP_400_BAD_REQUEST)

        from bookings.models import Booking
        bookings = Booking.objects.filter(
            court=court
        ).filter(
            Q(date=req_date) | Q(end_date=req_date) | Q(date=next_date) | Q(end_date=next_date) | Q(date=prev_date)
        ).exclude(status='CANCELLED').order_by('date', 'start_time')

        booked_slots = [
            {
                "start_time": str(b.start_time),
                "end_time": str(b.end_time),
                "date": str(b.date),
                "end_date": str(b.end_date or b.date)
            }
            for b in bookings
        ]

        is_overnight = court.closing_time <= court.opening_time

        return Response({
            "opening_time": court.opening_time,
            "closing_time": court.closing_time,
            "operating_days": court.operating_days or ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'],
            "is_overnight": is_overnight,
            "booked_slots": booked_slots
        })
