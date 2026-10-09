from django.core.management.base import BaseCommand
from bookings.models import Booking
from datetime import datetime

class Command(BaseCommand):
    help = 'Marks CONFIRMED bookings whose end datetime has passed as COMPLETED'

    def handle(self, *args, **options):
        now = datetime.now()
        # Find bookings that are CONFIRMED and end_time has passed for their date
        # Since start_time/end_time are TimeFields, we compare combined datetimes
        
        # This is a simplified approach: we look for bookings on dates before today,
        # or today's bookings that have already ended.
        
        bookings_to_complete = Booking.objects.filter(status='CONFIRMED')
        count = 0
        
        for booking in bookings_to_complete:
            end_dt = datetime.combine(booking.end_date or booking.date, booking.end_time)
            if end_dt < now:
                booking.status = 'COMPLETED'
                booking.save()
                count += 1
        
        self.stdout.write(self.style.SUCCESS(f'Successfully marked {count} bookings as COMPLETED'))
