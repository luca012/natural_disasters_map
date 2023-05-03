const {startDate, endDate} = getPageParams();

if (!isDateValid(startDate) || !isDateValid(endDate)) {
    window.location.href = "/";
}