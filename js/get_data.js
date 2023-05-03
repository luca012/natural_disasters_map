let searchButton = document.getElementById("search-button");

searchButton.addEventListener("click", function (e) {
    e.preventDefault();
    const rawStartDate = document.getElementById("start-date").value;
    const rawEndDate = document.getElementById("end-date").value;

    let startDate = isoDate(rawStartDate);
    let endDate = isoDate(rawEndDate);

    if (!isDateValid(rawStartDate) || !isDateValid(rawEndDate) || (startDate > endDate)) {
        alert("Please insert a correct date");
        throw new Error("Missing start date or end date");
    }
    
    location.href = "/html/earthquakes.html?startDate=" + startDate + "&endDate=" + endDate + "";
});