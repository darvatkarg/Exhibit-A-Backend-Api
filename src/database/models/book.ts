var mongoose = require('mongoose')

const bookSchema: any = new mongoose.Schema({
    main_categoryId: { type: mongoose.Schema.Types.ObjectId, default: null },
    categoryId: { type: mongoose.Schema.Types.ObjectId, default: null },
    subCategoryId: { type: mongoose.Schema.Types.ObjectId, default: null },
    genreId: { type: mongoose.Schema.Types.ObjectId, default: null },
    title: { type: String, default: null },
    author: { type: String, default: null },
    description: { type: String, default: null },
    language: { type: String, default: "English" },
    //summary: { type: String, default: null },
    page: { type: Number, default: 0 },
    cost: { type: Number, default: 0 },
    edition: { type: String, default: null },
    image: { type: String, default: null },
    pdf: { type: String, default: null },
    preview: { type: String, default: null },
    preview_video: { type: String },
    audio: { type: String, default: null },
    ePub: { type: String, default: null },       //GridFS - store file larger than 16 MB (pdf, audio,video,physical)
    video: { type: String },
    quantity: { type: Number },
    published_date: { type: Date, default: Date.now() },
    publisher: { type: String, default: null },
    feedback_rating: { type: Number, default: 0 },
    favoriteBy: { type: [{ type: mongoose.Schema.Types.ObjectId, ref: "userModel" }] },
    total_feedback: { type: Number, default: 0, min: 0 },
    isFree: { type: Boolean, default: true },
    isPhysical: { type: Boolean, default: false },
    isEnable: { type: Boolean, default: true },
    isActive: { type: Boolean, default: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId },
    updatedBy: { type: mongoose.Schema.Types.ObjectId },
}, { timestamps: true })

export const bookModel = mongoose.model('book', bookSchema)