// Hand-written domain types matching supabase/migrations/0001_customers_vehicles.sql
// When the schema stabilizes, replace with generated types via `supabase gen types typescript`.

export type CustomerSource = "website" | "referral" | "walk-in" | "social" | "other";

export type Customer = {
  id: string;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  first_name: string;
  last_name: string;
  email: string | null;
  phone: string | null;
  source: CustomerSource | null;
  notes: string | null;
};

export type CustomerInsert = Omit<
  Customer,
  "id" | "created_at" | "updated_at" | "deleted_at"
> & { id?: string };

export type CustomerUpdate = Partial<CustomerInsert>;

export type Vehicle = {
  id: string;
  customer_id: string;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  year: number | null;
  make: string | null;
  model: string | null;
  trim: string | null;
  vin: string | null;
  license_plate: string | null;
  color: string | null;
  notes: string | null;
};

export type VehicleInsert = Omit<
  Vehicle,
  "id" | "created_at" | "updated_at" | "deleted_at"
> & { id?: string };

export type VehicleUpdate = Partial<VehicleInsert>;

export type ServiceNoteCategory = "lighting" | "paint" | "coating" | "note" | "other";

export type ServiceNote = {
  id: string;
  vehicle_id: string;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  occurred_on: string; // ISO date
  category: ServiceNoteCategory;
  summary: string;
  detail: string | null;
  created_by: string | null;
};

export type ServiceNoteInsert = Omit<
  ServiceNote,
  "id" | "created_at" | "updated_at" | "deleted_at"
> & { id?: string };

export type ServiceNoteUpdate = Partial<ServiceNoteInsert>;

export type QuoteSource = "website" | "staff" | "phone" | "email" | "other";
export type QuoteStatus = "new" | "contacted" | "quoted" | "converted" | "lost";

export type Quote = {
  id: string;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  source: QuoteSource;
  status: QuoteStatus;
  customer_id: string | null;
  vehicle_id: string | null;
  configuration_id: string | null;
  job_id: string | null;
  lead_first_name: string | null;
  lead_last_name: string | null;
  lead_email: string | null;
  lead_phone: string | null;
  lead_city: string | null;
  vehicle_year: string | null;
  vehicle_make: string | null;
  vehicle_model: string | null;
  vehicle_trim: string | null;
  services_interest: string[];
  timeline: string | null;
  budget: string | null;
  desired_look: string | null;
  current_issues: string | null;
  message: string | null;
  staff_notes: string | null;
  estimated_total_cents: number | null;
};

export type QuoteInsert = Omit<Quote, "id" | "created_at" | "updated_at" | "deleted_at"> & {
  id?: string;
};
export type QuoteUpdate = Partial<QuoteInsert>;

export type FollowUpKind =
  | "post_delivery"
  | "review_request"
  | "seasonal"
  | "general"
  | "other";
export type FollowUpStatus = "pending" | "done" | "skipped";

export type FollowUp = {
  id: string;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  title: string;
  notes: string | null;
  kind: FollowUpKind;
  status: FollowUpStatus;
  due_on: string | null;
  customer_id: string | null;
  job_id: string | null;
  completed_at: string | null;
  assigned_to: string | null;
  created_by: string | null;
  email_sent_at: string | null;
};

export type FollowUpInsert = Omit<
  FollowUp,
  "id" | "created_at" | "updated_at" | "deleted_at" | "email_sent_at"
> & {
  id?: string;
  email_sent_at?: string | null;
};
export type FollowUpUpdate = Partial<FollowUpInsert>;

export type JobStatus =
  | "new"
  | "scheduled"
  | "in_shop"
  | "ready"
  | "delivered"
  | "cancelled";

export type JobStage = "paint" | "coat" | "qc" | "other";

export type Job = {
  id: string;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  customer_id: string | null;
  vehicle_id: string | null;
  title: string;
  summary: string | null;
  status: JobStatus;
  stage: JobStage | null;
  scheduled_for: string | null; // ISO date
  created_by: string | null;
};

export type JobInsert = Omit<Job, "id" | "created_at" | "updated_at" | "deleted_at"> & {
  id?: string;
};

export type JobUpdate = Partial<JobInsert>;

export type PartCategory =
  | "lighting"
  | "powder"
  | "paint"
  | "coating"
  | "fabrication"
  | "consumable"
  | "tool"
  | "other";

export type PartItemType = "part" | "consumable" | "tool" | "kit";

export type Part = {
  id: string;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  sku: string;
  barcode: string | null;
  name: string;
  category: PartCategory;
  item_type: PartItemType;
  uom: string;
  cost_cents: number;
  last_cost_cents: number | null;
  price_cents: number | null;
  on_hand: number;
  min_qty: number;
  par_qty: number | null;
  vendor: string | null;
  vendor_sku: string | null;
  lead_time_days: number | null;
  location: string | null;
  notes: string | null;
  active: boolean;
};

export type PartInsert = Omit<Part, "id" | "created_at" | "updated_at" | "deleted_at"> & {
  id?: string;
};
export type PartUpdate = Partial<PartInsert>;

export type PartBatch = {
  id: string;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  part_id: string;
  batch_number: string;
  received_on: string; // ISO date
  unit_cost_cents: number | null;
  quantity_received: number;
  quantity_remaining: number;
  expires_on: string | null;
  notes: string | null;
};

export type PartBatchInsert = Omit<
  PartBatch,
  "id" | "created_at" | "updated_at" | "deleted_at"
> & { id?: string };
export type PartBatchUpdate = Partial<PartBatchInsert>;

export type MovementType = "receive" | "use" | "adjust" | "count" | "return";

export type PartMovement = {
  id: string;
  created_at: string;
  occurred_at: string;
  part_id: string;
  batch_id: string | null;
  movement_type: MovementType;
  quantity: number;
  unit_cost_cents: number | null;
  job_id: string | null;
  reason: string | null;
  notes: string | null;
  performed_by: string | null;
};

export type PartMovementInsert = Omit<PartMovement, "id" | "created_at"> & { id?: string };

export type CountSessionStatus = "in_progress" | "committed" | "cancelled";

export type CountSession = {
  id: string;
  created_at: string;
  updated_at: string;
  title: string;
  status: CountSessionStatus;
  location: string | null;
  opened_by: string | null;
  opened_at: string;
  committed_at: string | null;
  notes: string | null;
};

export type CountSessionInsert = Omit<CountSession, "id" | "created_at" | "updated_at"> & {
  id?: string;
};
export type CountSessionUpdate = Partial<CountSessionInsert>;

export type CountEntry = {
  id: string;
  created_at: string;
  updated_at: string;
  session_id: string;
  part_id: string;
  expected_qty: number;
  actual_qty: number;
  notes: string | null;
};

export type CountEntryInsert = Omit<CountEntry, "id" | "created_at" | "updated_at"> & {
  id?: string;
};
export type CountEntryUpdate = Partial<CountEntryInsert>;

export type PurchaseOrderStatus =
  | "draft"
  | "sent"
  | "partial_received"
  | "received"
  | "cancelled";

export type PurchaseOrder = {
  id: string;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  po_number: string | null;
  vendor: string;
  status: PurchaseOrderStatus;
  ordered_on: string | null;
  expected_on: string | null;
  received_on: string | null;
  notes: string | null;
  created_by: string | null;
};

export type PurchaseOrderInsert = Omit<
  PurchaseOrder,
  "id" | "created_at" | "updated_at" | "deleted_at"
> & { id?: string };
export type PurchaseOrderUpdate = Partial<PurchaseOrderInsert>;

export type PurchaseOrderItem = {
  id: string;
  created_at: string;
  updated_at: string;
  purchase_order_id: string;
  part_id: string | null;
  label: string;
  vendor_sku: string | null;
  quantity_ordered: number;
  quantity_received: number;
  unit_cost_cents: number | null;
  notes: string | null;
};

export type PurchaseOrderItemInsert = Omit<
  PurchaseOrderItem,
  "id" | "created_at" | "updated_at"
> & { id?: string };
export type PurchaseOrderItemUpdate = Partial<PurchaseOrderItemInsert>;

export type MessageChannel = "sms" | "email";
export type MessageDirection = "in" | "out";
export type MessageStatus = "queued" | "sending" | "sent" | "failed";

export type Message = {
  id: string;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  customer_id: string | null;
  job_id: string | null;
  channel: MessageChannel;
  direction: MessageDirection;
  to_address: string;
  from_address: string | null;
  subject: string | null;
  body: string;
  template: string | null;
  status: MessageStatus;
  provider_id: string | null;
  error: string | null;
  sent_at: string | null;
  sent_by: string | null;
};

export type MessageInsert = Omit<
  Message,
  "id" | "created_at" | "updated_at" | "deleted_at"
> & { id?: string };
export type MessageUpdate = Partial<MessageInsert>;

export type AttachmentKind = "photo" | "document";
export type AttachmentTag = "before" | "after" | "reference" | null;

export type JobAttachment = {
  id: string;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  job_id: string;
  storage_path: string;
  filename: string;
  content_type: string | null;
  size_bytes: number | null;
  kind: AttachmentKind;
  tag: AttachmentTag;
  caption: string | null;
  uploaded_by: string | null;
};

export type JobAttachmentInsert = Omit<
  JobAttachment,
  "id" | "created_at" | "updated_at" | "deleted_at"
> & { id?: string };
export type JobAttachmentUpdate = Partial<JobAttachmentInsert>;

export type Database = {
  public: {
    Tables: {
      customers: {
        Row: Customer;
        Insert: CustomerInsert;
        Update: CustomerUpdate;
      };
      vehicles: {
        Row: Vehicle;
        Insert: VehicleInsert;
        Update: VehicleUpdate;
      };
      service_notes: {
        Row: ServiceNote;
        Insert: ServiceNoteInsert;
        Update: ServiceNoteUpdate;
      };
      jobs: {
        Row: Job;
        Insert: JobInsert;
        Update: JobUpdate;
      };
      quotes: {
        Row: Quote;
        Insert: QuoteInsert;
        Update: QuoteUpdate;
      };
      follow_ups: {
        Row: FollowUp;
        Insert: FollowUpInsert;
        Update: FollowUpUpdate;
      };
      parts: {
        Row: Part;
        Insert: PartInsert;
        Update: PartUpdate;
      };
      part_batches: {
        Row: PartBatch;
        Insert: PartBatchInsert;
        Update: PartBatchUpdate;
      };
      part_movements: {
        Row: PartMovement;
        Insert: PartMovementInsert;
        Update: never;
      };
      count_sessions: {
        Row: CountSession;
        Insert: CountSessionInsert;
        Update: CountSessionUpdate;
      };
      count_entries: {
        Row: CountEntry;
        Insert: CountEntryInsert;
        Update: CountEntryUpdate;
      };
      purchase_orders: {
        Row: PurchaseOrder;
        Insert: PurchaseOrderInsert;
        Update: PurchaseOrderUpdate;
      };
      purchase_order_items: {
        Row: PurchaseOrderItem;
        Insert: PurchaseOrderItemInsert;
        Update: PurchaseOrderItemUpdate;
      };
      messages: {
        Row: Message;
        Insert: MessageInsert;
        Update: MessageUpdate;
      };
      job_attachments: {
        Row: JobAttachment;
        Insert: JobAttachmentInsert;
        Update: JobAttachmentUpdate;
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
  };
};
