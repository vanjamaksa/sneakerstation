let url = location.href;

function ajaxCallback(file, callback){
    $.ajax({
        url: "js/" + file,
        method: "get",
        dataType: "json",
        success: function(arr){
            callback(arr)
        },
        error: function(jqXHR, exception){
            var msg = "";
            if (jqXHR.status === 0) {
                msg = 'Not connect.\n Verify Network.';
            } else if (jqXHR.status == 404) {
                msg = 'Error 404. Requested page not found.';
            } else if (jqXHR.status == 500) {
                msg = 'Error 500. Internal Server Error.';
            } else if (exception === 'parsererror') {
                msg = 'Requested JSON parse failed.';
            } else if (exception === 'timeout') {
                msg = 'Time out error.';
            } else if (exception === 'abort') {
                msg = 'Ajax request aborted.';
            } else {
                msg = 'Uncaught Error.\n' + jqXHR.responseText;
            }
            document.getElementById("printError").innerHTML = msg;
        }
    })
}

function createStoreItem(price, salePrice, brand, name, imgSrc, imgAlt) {
    return `
    <div class="col">
        <div class="card rounded-0 shadow-sm d-flex align-items-center">
            <div class="shoes-thumbnail-wrap">
                <img class="shoes-thumbnail" src="${imgSrc}" alt="${imgAlt}">
            </div>
    
            <div class="card-body d-flex flex-column align-items-center my-0">
                <div class="d-flex ">
                    <h4 class="fw-light mx-2 fs-5">${brand}</h4>
                    <h4 class="fs-5">${name}</h4>
                </div>
                <p class="fs-5 fw-bold text-danger mb-0">${salePrice} RSD</p>
                <p class="fs-7 fw-light strike mb-0 muted"><s>${price} RSD</s></p>
            </div>
        </div>
    </div>
    `;    
}
const storeContent = $('#store-content');

ajaxCallback('./products.json', (data) => {
    data.forEach(p => {
        storeContent.append(storeContent.append(createStoreItem(p.price, p.salePrice, p.brand, p.name, p.img.src, p.img.alt)));
    });
});