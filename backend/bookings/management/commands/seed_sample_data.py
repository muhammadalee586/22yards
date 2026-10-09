from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from courts.models import Court
from shop.models import Category, Product
from bookings.models import Review
from decimal import Decimal

User = get_user_model()

class Command(BaseCommand):
    help = 'Seeds realistic courts, products, and reviews for demonstration and testing'

    def handle(self, *args, **options):
        self.stdout.write("Seeding sample data for 22 Yards...")

        # 1. Get or create owner user
        owner, _ = User.objects.get_or_create(
            username='courtowner',
            defaults={
                'email': 'courtowner@22yards.pk',
                'role': User.Role.OWNER,
                'phone_number': '03001234567',
                'first_name': 'Wasim',
                'last_name': 'Akram',
            }
        )
        if not owner.has_usable_password():
            owner.set_password('admin123')
            owner.save()

        # Player user
        player, _ = User.objects.get_or_create(
            username='player2',
            defaults={
                'email': 'player2@22yards.pk',
                'role': User.Role.USER,
                'phone_number': '03119876543',
                'first_name': 'Babar',
                'last_name': 'Azam',
            }
        )
        if not player.has_usable_password():
            player.set_password('admin123')
            player.save()

        # 2. Courts
        courts_data = [
            {
                'name': 'National Arena Indoor Cricket',
                'description': 'Premium climate-controlled indoor cricket court featuring professional grade AstroTurf, automated bowling machine, high-lux LED lighting, and pavilion seating.',
                'address': 'Plot 42, Block 5, Clifton',
                'city': 'Karachi',
                'price_per_hour': Decimal('3500.00'),
                'opening_time': '06:00',
                'closing_time': '02:00',
                'turf_type': 'ASTROTURF',
                'has_ac': True,
                'has_parking': True,
                'average_rating': Decimal('4.9'),
                'total_reviews': 12,
            },
            {
                'name': 'Gaddafi SuperTurf Arena',
                'description': 'Tournament-standard indoor cricket pitch with spring carpet underlay, digital scoreboard, speed radar guns, and spacious dugout for 20 players.',
                'address': 'Main Boulevard, Gulberg III',
                'city': 'Lahore',
                'price_per_hour': Decimal('3000.00'),
                'opening_time': '08:00',
                'closing_time': '23:00',
                'turf_type': 'CARPET',
                'has_ac': True,
                'has_parking': True,
                'average_rating': Decimal('4.8'),
                'total_reviews': 8,
            },
            {
                'name': 'Rawal Pitch & Strike Arena',
                'description': 'Popular floodlit indoor turf offering pristine bounce, side nets for bowling drills, spectator stands, and on-site refreshment zone.',
                'address': 'Sector F-10/3, Street 14',
                'city': 'Islamabad',
                'price_per_hour': Decimal('2800.00'),
                'opening_time': '07:00',
                'closing_time': '00:00',
                'turf_type': 'ASTROTURF',
                'has_ac': False,
                'has_parking': True,
                'average_rating': Decimal('4.7'),
                'total_reviews': 5,
            },
            {
                'name': 'Defence Champions Indoor Club',
                'description': 'Acoustic-damped indoor cricket venue designed for tape-ball and hard-ball leagues. Includes full HD match recording system and lounge.',
                'address': 'Phase 6, DHA',
                'city': 'Karachi',
                'price_per_hour': Decimal('4000.00'),
                'opening_time': '06:00',
                'closing_time': '03:00',
                'turf_type': 'ASTROTURF',
                'has_ac': True,
                'has_parking': True,
                'average_rating': Decimal('5.0'),
                'total_reviews': 19,
            },
        ]

        created_courts = []
        for cd in courts_data:
            court, created = Court.objects.get_or_create(
                name=cd['name'],
                defaults={
                    'owner': owner,
                    'description': cd['description'],
                    'address': cd['address'],
                    'city': cd['city'],
                    'price_per_hour': cd['price_per_hour'],
                    'opening_time': cd['opening_time'],
                    'closing_time': cd['closing_time'],
                    'turf_type': cd['turf_type'],
                    'has_ac': cd['has_ac'],
                    'has_parking': cd['has_parking'],
                    'average_rating': cd['average_rating'],
                    'total_reviews': cd['total_reviews'],
                }
            )
            created_courts.append(court)

        # 3. Sample Reviews
        if created_courts:
            c1 = created_courts[0]
            Review.objects.get_or_create(
                user=player,
                court=c1,
                defaults={
                    'rating': 5,
                    'comment': 'Best turf in Karachi! The lighting is immaculate, no blind spots under the high ceiling, and the AC makes summer matches super comfortable.'
                }
            )

        # 4. Shop Categories
        cats = [
            ('Bats', 'cricket-bats', 'Grade 1 English and Kashmir willow cricket bats'),
            ('Balls', 'cricket-balls', 'High quality leather, seam, and heavy tape balls'),
            ('Protective Gear', 'protective-gear', 'Helmets, pads, batting gloves, and thigh guards'),
            ('Accessories', 'cricket-accessories', 'Grip cones, bat mallet, kit bags, and sweatbands'),
        ]
        created_cats = {}
        for name, slug, desc in cats:
            cat, _ = Category.objects.get_or_create(
                slug=slug,
                defaults={'name': name, 'description': desc}
            )
            created_cats[slug] = cat

        # 5. Products
        products_data = [
            {
                'category': created_cats['cricket-bats'],
                'name': 'Kookaburra Ghost Pro English Willow Bat',
                'description': 'Balanced pick-up, massive sweet spot, 8–10 straight grains. Pre-knocked and ready for league play.',
                'price': Decimal('28500.00'),
                'stock': 12,
                'is_featured': True,
                'is_available': True,
            },
            {
                'category': created_cats['cricket-bats'],
                'name': 'CA Plus 15000 7-Star Player Edition',
                'description': 'Lightweight scoop profile with maximum wood in hitting area. Ideal for fast-paced T20 indoor and outdoor cricket.',
                'price': Decimal('32000.00'),
                'stock': 8,
                'is_featured': True,
                'is_available': True,
            },
            {
                'category': created_cats['cricket-balls'],
                'name': 'SG Club Four-Piece Leather Ball (Box of 6)',
                'description': 'Top grade alum tanned leather with durable pronounced seam. Excellent shape retention on indoor turf surfaces.',
                'price': Decimal('5400.00'),
                'stock': 35,
                'is_featured': False,
                'is_available': True,
            },
            {
                'category': created_cats['protective-gear'],
                'name': 'Shrey Master Class Air Titanium Helmet',
                'description': 'Ultralight titanium grille, high impact ABS outer shell, extended back protection, and micro-ventilation.',
                'price': Decimal('16500.00'),
                'stock': 15,
                'is_featured': True,
                'is_available': True,
            },
            {
                'category': created_cats['protective-gear'],
                'name': 'Gray-Nicolls Shockwave Pro Batting Gloves',
                'description': 'Multi-flex ergonomic finger splits with shark tooth high-density foam for premium finger impact absorption.',
                'price': Decimal('7200.00'),
                'stock': 20,
                'is_featured': False,
                'is_available': True,
            },
            {
                'category': created_cats['cricket-accessories'],
                'name': '22 Yards Pro Duffle Cricket Kit Bag',
                'description': 'Heavy duty water-resistant 1000D Cordura bag with dedicated bat sleeves, insulated cooler pocket, and footwear compartment.',
                'price': Decimal('8900.00'),
                'stock': 25,
                'is_featured': True,
                'is_available': True,
            },
        ]

        for pd in products_data:
            Product.objects.get_or_create(
                name=pd['name'],
                defaults={
                    'category': pd['category'],
                    'description': pd['description'],
                    'price': pd['price'],
                    'stock': pd['stock'],
                    'is_featured': pd['is_featured'],
                    'is_available': pd['is_available'],
                }
            )

        self.stdout.write(self.style.SUCCESS("Successfully seeded sample courts, products, and reviews!"))
