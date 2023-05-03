function getPageParams(url){
    const searchParams = new URLSearchParams(url ?? window.location.search);
    const params = Object.fromEntries(searchParams.entries());
    return params;
}

function isoDate(date) {
    if (!date) return null
    return new Date(date).toISOString().substring(0, 10);
}

function isDateValid(date){
    if (!date) return false
    
    try {
        const tryDate = new Date(date);
        if (tryDate == "Invalid Date") throw new Error("Invalid Date")
    } catch (error) {
        return false
    }

    return true
}