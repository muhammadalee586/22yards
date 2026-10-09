from rest_framework import serializers
from django.core.exceptions import ValidationError
from decimal import Decimal
from datetime import datetime, date, time, timedelta
from .models import Booking, Review
from courts.serializers import CourtSerializer

class ReviewSerializer(serializers.ModelSerializer):
    user_name = serializers.CharField(source='user.username', read_only=True)

    class Meta:
        model = Review
        fields = ('id', 'user', 'user_name', 'court', 'rating', 'comment', 'created_at')
        read_only_fields = ('user',)

class BookingSerializer(serializers.ModelSerializer):
    court_details = CourtSerializer(source='court', read_only=True)

    class Meta:
        model = Booking
        fields = '__all__'
        read_only_fields = ('user', 'total_price', 'status', 'payment_status')

    def validate(self, data):
        # Merge incoming data with instance for partial updates (PATCH)
        instance = getattr(self, 'instance', None)
        start_time = data.get('start_time', getattr(instance, 'start_time', None))
        end_time = data.get('end_time', getattr(instance, 'end_time', None))
        booking_date = data.get('date', getattr(instance, 'date', None))
        court = data.get('court', getattr(instance, 'court', None))
        advance_payment = data.get('advance_payment', getattr(instance, 'advance_payment', Decimal('0.00')))

        if not all([start_time, end_time, booking_date, court]):
            return data

        # 1. End time must be after start time (unless it spans midnight)
        end_date = data.get('end_date', getattr(instance, 'end_date', None))
        if start_time >= end_time and end_date == booking_date:
            raise serializers.ValidationError({"end_time": "End time must be after start time unless the booking spans midnight."})

        # 2. Check if within court opening/closing hours
        # Handle overnight operations (e.g., opening_time=18:00, closing_time=06:00)
        is_overnight = court.closing_time <= court.opening_time

        if is_overnight:
            valid_start = (start_time >= court.opening_time) or (start_time < court.closing_time)
            valid_end = (end_time <= court.closing_time) or (end_time > court.opening_time)
            if not (valid_start and valid_end):
                raise serializers.ValidationError({
                    "start_time": f"For overnight operation, booking must be within {court.opening_time} and {court.closing_time} next morning."
                })
        else:
            # Normal daytime operation
            if start_time < court.opening_time or end_time > court.closing_time:
                raise serializers.ValidationError({
                    "start_time": f"Booking must be between {court.opening_time} and {court.closing_time}."
                })

        # 3. Check operating days
        # For overnight courts, post-midnight slots belong to the previous evening's operational session
        if is_overnight and start_time < court.closing_time:
            session_date = booking_date - timedelta(days=1)
        else:
            session_date = booking_date

        day_abbr = session_date.strftime('%a')[:3].upper()
        court_days = getattr(court, 'operating_days', None) or ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN']
        if day_abbr not in court_days:
            raise serializers.ValidationError({"date": f"This court is closed on {session_date.strftime('%A')}s."})

        # 4. Date must not be in the past
        from django.utils import timezone
        local_now = timezone.localtime(timezone.now())
        start_dt_check = datetime.combine(booking_date, start_time)
        if timezone.is_naive(start_dt_check):
            from django.utils.timezone import get_current_timezone
            start_dt_check = timezone.make_aware(start_dt_check, get_current_timezone())
        
        if start_dt_check <= local_now:
            raise serializers.ValidationError({"start_time": "Booking time cannot be in the past."})

        # 4. Duration: at least 60 mins and multiple of 30 mins
        # Combine date and time to compute duration correctly
        end_dt_date = end_date if end_date else booking_date
        start_dt = datetime.combine(booking_date, start_time)
        end_dt = datetime.combine(end_dt_date, end_time)
        duration_delta = end_dt - start_dt
        duration_minutes = duration_delta.total_seconds() / 60

        if duration_minutes < 60:
            raise serializers.ValidationError({"end_time": "Minimum booking duration is 60 minutes."})
        if duration_minutes % 30 != 0:
            raise serializers.ValidationError({"end_time": "Booking duration must be a multiple of 30 minutes."})

        # 5. Advance payment check (calculated total_price is handled in view, 
        # but we can check basic constraints here if total_price is already on instance)
        total_price = getattr(instance, 'total_price', None)
        if total_price is not None:
            if advance_payment < 0 or advance_payment > total_price:
                raise serializers.ValidationError({"advance_payment": "Advance payment must be between 0 and total price."})

        return data
