/**
 * UI Components Library - Barrel Export
 * 
 * This file exports all UI components for convenient importing.
 * 
 * Usage:
 *   import { Button, Card, Dialog, ... } from "@/components/ui";
 */

// Core components
export { Button, buttonVariants, type ButtonProps } from "./button";
export { Input } from "./input";
export { Label } from "./label";
export { Textarea } from "./textarea";

// Layout components
export {
  Container,
  Section,
  PageHeader,
  Grid,
  Flex,
  Stack,
  Divider,
} from "./layout";

// Card components
export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardDescription,
  CardContent,
} from "./card";

// Dialog components
export {
  Dialog,
  DialogPortal,
  DialogOverlay,
  DialogTrigger,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
} from "./dialog";

// Dropdown components
export {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuCheckboxItem,
  DropdownMenuRadioItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuGroup,
  DropdownMenuPortal,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuRadioGroup,
} from "./dropdown-menu";

// Select components
export {
  Select,
  SelectGroup,
  SelectValue,
  SelectTrigger,
  SelectContent,
  SelectLabel,
  SelectItem,
  SelectSeparator,
  SelectField,
} from "./select";

// Switch component
export { Switch, SwitchField } from "./switch";

// Tabs components
export { Tabs, TabsList, TabsTrigger, TabsContent } from "./tabs";

// Scroll Area
export { ScrollArea, ScrollBar } from "./scroll-area";

// Separator
export { Separator } from "./separator";

// Slider
export { Slider } from "./slider";

// Avatar
export { Avatar, AvatarFallback, AvatarImage } from "./avatar";

// Badge
export { Badge, badgeVariants, type BadgeProps } from "./badge";

// Alert components
export { Alert, AlertTitle, AlertDescription } from "./alert";

// Empty/Error state components
export {
  EmptyState,
  NoSearchResults,
  NoData,
  ErrorState,
} from "./empty-state";

// Spinner/Loading components
export { Spinner, spinnerVariants, PageLoader, InlineLoader } from "./spinner";

// Toast/Notification
export { Toaster, toast } from "./toaster";

// Confirmation Dialog
export { ConfirmDialog, useConfirmDialog } from "./confirm-dialog";

// Input Dialog
export { InputDialog, useInputDialog } from "./input-dialog";

// Form components
export {
  Form,
  FormField,
  FormLabel,
  FormDescription,
  FormError,
  FormActions,
  FormSection,
  useFormContext,
} from "./form";

// Custom modals (backward compatibility)
export { LogoutModal } from "./logout-modal";
export { DeleteConfirmationModal } from "./delete-confirmation-modal";
export { ReportModal } from "./report-modal";
export { BlockUserModal, UnblockUserModal } from "./block-user-modal";
export { AIDisclaimerModal } from "./ai-disclaimer-modal";
export { ContentWarning } from "./content-warning";

// Accessibility
export { SkipLink, VisuallyHidden, LiveRegion, focusRingClasses, touchTargetClasses } from "./accessibility";

// Responsive
export { MobileOnly, DesktopOnly } from "./responsive";

// Rich Text Editor
export { RichTextEditor } from "./rich-text-editor";

// Image Upload
export { ImageUpload } from "./image-upload";

// Skeleton
export { Skeleton } from "./skeleton";

// Error Boundary
export { ErrorBoundary } from "./error-boundary";
