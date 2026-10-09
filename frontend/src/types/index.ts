export interface User {
  id: number;
  username: string;
  email: string;
  role: 'USER' | 'OWNER' | 'ADMIN';
  phone_number: string;
  first_name: string;
  last_name: string;
  profile_picture?: string;
}

export interface Category {
  id: number;
  name: string;
  slug: string;
  description: string;
  image?: string;
}

export interface Product {
  id: number;
  category: number;
  category_name: string;
  name: string;
  description: string;
  price: string;
  stock: number;
  main_image: string;
  gallery: string[];
  is_featured: boolean;
  is_available: boolean;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface Court {
  id: number;
  owner: number;
  owner_name: string;
  name: string;
  description: string;
  address: string;
  city: string;
  price_per_hour: string;
  opening_time: string;
  closing_time: string;
  operating_days?: string[];
  main_image: string;
  gallery: string[];
  has_ac: boolean;
  has_parking: boolean;
  turf_type: 'ASTROTURF' | 'CARPET' | 'WOOD';
  average_rating: string;
  total_reviews: number;
}

export interface Booking {
  id: number;
  user: number;
  court: number;
  court_details: Court;
  date: string;
  start_time: string;
  end_time: string;
  total_price: string;
  advance_payment: string;
  status: 'PENDING' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED';
  payment_status: 'PENDING' | 'PAID' | 'FAILED';
  created_at: string;
}

export interface Review {
  id: number;
  user: number;
  court: number;
  rating: number;
  comment: string;
  created_at: string;
}

export interface Order {
  id: number;
  user: number;
  total_amount: string;
  payment_status: 'PENDING' | 'PAID' | 'FAILED';
  shipping_address: string;
  items: OrderItem[];
  total_items: number;
  created_at: string;
}

export interface OrderItem {
  id: number;
  product: number;
  product_name: string;
  quantity: number;
  unit_price: string;
}

export interface Paginated<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export interface OwnerStatsData {
  revenue: number;
  totalBookings: number;
  pendingRequests: number;
}
