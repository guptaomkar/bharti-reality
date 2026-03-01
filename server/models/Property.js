import mongoose from "mongoose";

const { Schema } = mongoose;

// ─── Sub-schemas ──────────────────────────────────────────────────────────────

const PriceSchema = new Schema({
  amount: { type: Number, required: true, min: 0 },
  currency: { type: String, default: "USD", uppercase: true },
  priceType: { type: String, enum: ["for-sale", "for-rent", "per-night"], default: "for-sale" },
}, { _id: false });

const LocationSchema = new Schema({
  address: { type: String, required: true },
  city: { type: String, required: true, index: true },
  state: { type: String },
  country: { type: String, required: true },
  zipCode: { type: String },
  neighborhood: { type: String },
  coordinates: {
    lat: { type: Number },
    lng: { type: Number },
  },
}, { _id: false });

const DetailsSchema = new Schema({
  bedrooms: { type: Number, default: 0 },
  bathrooms: { type: Number, default: 0 },
  halfBaths: { type: Number, default: 0 },
  squareFeet: { type: Number, default: 0 },
  lotSize: { type: Number },
  floors: { type: Number, default: 1 },
  yearBuilt: { type: Number },
  parking: { type: Number, default: 0 },
  garage: { type: Boolean, default: false },
  pool: { type: Boolean, default: false },
  furnished: { type: Boolean, default: false },
}, { _id: false });

const DescriptionSchema = new Schema({
  short: { type: String, maxlength: 300 },
  full: { type: String },
}, { _id: false });

const MediaSchema = new Schema({
  coverImage: { type: String },
  photos: [{ type: String }],
  videos: [{ type: String }],
  floorPlans: [{ type: String }],
  virtualTourUrl: { type: String },
}, { _id: false });

const AgentSchema = new Schema({
  name: { type: String },
  phone: { type: String },
  email: { type: String },
  photo: { type: String },
  license: { type: String },
}, { _id: false });

const MetaSchema = new Schema({
  views: { type: Number, default: 0 },
  saves: { type: Number, default: 0 },
  inquiries: { type: Number, default: 0 },
}, { _id: false });

// ─── Main Schema ──────────────────────────────────────────────────────────────

const PropertySchema = new Schema({
  title: { type: String, required: true, trim: true },
  slug: { type: String, unique: true, lowercase: true, trim: true },
  status: {
    type: String,
    enum: ["for-sale", "for-rent", "sold", "off-market"],
    default: "for-sale",
  },
  featured: { type: Boolean, default: false },
  type: {
    type: String,
    enum: ["penthouse", "villa", "apartment", "loft", "mansion", "townhouse", "cottage", "estate", "chalet"],
    required: true,
  },
  category: { type: String, default: "residential" },

  price: { type: PriceSchema, required: true },
  location: { type: LocationSchema, required: true },
  details: { type: DetailsSchema, default: () => ({}) },
  description: { type: DescriptionSchema, default: () => ({}) },
  amenities: [{ type: String }],
  media: { type: MediaSchema, default: () => ({}) },
  agent: { type: AgentSchema, default: () => ({}) },
  meta: { type: MetaSchema, default: () => ({}) },

  // Legacy compat fields (from Prisma/Residency model)
  image: { type: String },
  address: { type: String },
  city: { type: String },
  country: { type: String },
  facilities: { type: Schema.Types.Mixed },
  userEmail: { type: String },
}, {
  timestamps: true,
});

// ─── Indexes ──────────────────────────────────────────────────────────────────
PropertySchema.index({ "location.city": 1, status: 1 });
PropertySchema.index({ "price.amount": 1 });
PropertySchema.index({ type: 1, category: 1 });
PropertySchema.index({ featured: 1, createdAt: -1 });
// Note: slug index is already created by unique:true in the field definition


// ─── Auto-generate slug from title ────────────────────────────────────────────
const slugify = (str) =>
  str
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();

PropertySchema.pre("save", async function (next) {
  if (!this.isModified("title") && this.slug) return next();

  let base = slugify(this.title);
  let slug = base;
  let count = 1;

  while (await mongoose.model("Property").exists({ slug, _id: { $ne: this._id } })) {
    slug = `${base}-${count++}`;
  }

  this.slug = slug;

  // Sync legacy fields from new schema
  if (!this.city && this.location?.city) this.city = this.location.city;
  if (!this.country && this.location?.country) this.country = this.location.country;
  if (!this.address && this.location?.address) this.address = this.location.address;
  if (!this.image && this.media?.coverImage) this.image = this.media.coverImage;

  next();
});

export default mongoose.model("Property", PropertySchema);
