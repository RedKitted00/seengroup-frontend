import React from 'react';
import {
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  Download,
  Eye,
  Facebook,
  Instagram,
  Linkedin,
  MapPin,
  Mail,
  Search,
  HelpCircle,
  Twitter,
  Upload,
  MessageCircle,
  X,
  ChevronDown,
  Globe,
  Printer,
  Link as LinkIcon,
  Youtube,
  User,
  CheckCircle,
  Package,
  Trash2,
  Trash,
  Plus,
  Loader2,
  Send,
  ChevronLeft,
  ChevronRight,
  ChevronRight as ChevronRightMini,
  CloudUpload,
  Building,
  Info,
  ListTodo,
  Star,
  Calendar,
  Briefcase,
  Lock,
  Filter,
  Grid3X3,
  List
} from 'lucide-react';

interface IconProps {
  name: string;
  className?: string;
  size?: number;
  style?: React.CSSProperties;
}

const iconMap: Record<string, React.ComponentType<{ className?: string; size?: number; strokeWidth?: number; style?: React.CSSProperties }>> = {
  'icon-arrow-left': ArrowLeft,
  'icon-arrow-right': ArrowRight,
  'icon-arrow-skew': ArrowUpRight,
  'icon-download': Download,
  'icon-eye': Eye,
  'icon-facebook': Facebook,
  'icon-instagram': Instagram,
  'icon-linkedin': Linkedin,
  'icon-location': MapPin,
  'icon-mail': Mail,
  'icon-search': Search,
  'icon-support': HelpCircle,
  'icon-twitter': Twitter,
  'icon-upload': Upload,
  'icon-whatsapp': MessageCircle,
  'icon-cross': X,
  'icon-close': X,
  'icon-mini-down': ChevronDown,
  'icon-map': Globe,
  'icon-printer': Printer,
  'icon-link': LinkIcon,
  'icon-youtube': Youtube,
  // Contact page icons
  'icon-user': User,
  'icon-check': CheckCircle,
  'icon-package': Package,
  'icon-trash': Trash2,
  'icon-trash-delete': Trash, // Alternative trash icon for consistency
  'icon-plus': Plus,
  'icon-spinner': Loader2,
  'icon-send': Send,
  // Career page icons
  'icon-chevron-left': ChevronLeft,
  'icon-chevron-right': ChevronRight,
  'icon-mini-right': ChevronRightMini,
  'icon-cloud-upload': CloudUpload,
  'icon-building': Building,
  'icon-info': Info,
  'icon-list-check': ListTodo,
  'icon-star': Star,
  'icon-calendar': Calendar,
  'icon-briefcase': Briefcase,
  'icon-lock': Lock,
  // Social media variants
  'icon-facebook-2': Facebook,
  'icon-linkedin-2': Linkedin,
  'icon-twitter-2': Twitter,
  'icon-mail-2': Mail,
  // Product page icons
  'icon-filter': Filter,
  'icon-grid': Grid3X3,
  'icon-list': List,
  // Message icon for contact page
  'icon-message': MessageCircle,
  // Alert icon for notifications
  'icon-alert': HelpCircle,
};

export default function Icon({ name, className = '', size = 16, style }: IconProps) {
  const IconComponent = iconMap[name];
  
  if (!IconComponent) {
    console.warn(`Icon "${name}" not found`);
    return null;
  }

  return (
    <IconComponent 
      className={className} 
      size={size}
      strokeWidth={1.5}
      style={style}
    />
  );
}

