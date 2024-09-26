const Contact = require('../models/contactUsModel');
const { catchAsync } = require('../utils/catchAsync');

exports.createContact = catchAsync(async (req, res, next) => {
    const { userName, email, message } = req.body;
    const newContact = await Contact.create({ userName, email, message });
    res.status(201).json(newContact);
});

exports.getAllContacts = catchAsync(async (req, res, next) => {
    const contacts = await Contact.find();
    res.status(200).json(contacts);
});

exports.deleteContactById = catchAsync(async (req, res, next) => {
    const { id } = req.params;
    const deletedContact = await Contact.findByIdAndDelete(id);
    if (!deletedContact) {
        return res.status(404).json({ message: 'Contact not found' });
    }
    res.status(200).json(deletedContact);
});
