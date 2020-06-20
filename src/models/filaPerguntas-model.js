const mongoose = require('mongoose')

const filaPerguntas = mongoose.Schema({
    id: {
        type: Number,
        trim: true
    },
    seller_id: {
        type: Number,
        trim: true
    },
    nick_name: {
        type: String,
        trim: true
    },
    text: {
        type: String,
        trim: true
    },
    status: {
        type: String,
        trim: true
    },
    item_id: {
        type: String,
        trim: true
    },
    title: {
        type: String,
        trim: true
    },
    date_created: {
        type: String,
        trim: true
    },
    hold: {
        type: Boolean
    },
    deleted_from_listing: {
        type: Boolean
    },
    answer: {
        text: {
            type: String,
            trim: true
        },
        status: {
            type: String,
            trim: true
        },
        date_created: {
            type: String,
            trim: true
        }
    },
    from: {
        id: {
            type: Number,
            trim: true
        },
        answered_questions: {
            type: Number
        }
    }
})

module.exports = mongoose.model('filaPerguntas', filaPerguntas)