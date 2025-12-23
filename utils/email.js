exports.formatDate = (isoString) => {
    const d = new Date(isoString);
    return d.toLocaleString();
};

exports.validateEmail = (email) => {
    const re = /\S+@\S+\.\S+/;
    return re.test(email);
};