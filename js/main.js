let url = location.href;

function ajaxCallback(file, callback) {
    $.ajax({
        url: "js/" + file,
        method: "get",
        dataType: "json",
        success: (arr) => {
            callback(arr)
        },
        error: (jqXHR, exception) => {
            const errorContainer = $('#ajax-error');
            let msg = "";
            if (jqXHR.status === 0) {
                msg = 'Not connect.\n Verify Network.';
            } else if (jqXHR.status == 404) {
                msg = `Error 404. Requested page not found. (${file})`;
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

            let result = `
                <div class="error-field d-flex align-items-center justify-content-center">
                    <p class="text-danger fw-bold fs-5">${msg}</p>
                </div>
                `
            errorContainer.html(result);
        }
    })
}

function setLS(name, value) {
    localStorage.setItem(name, JSON.stringify(value));
}

function getLS(name) {
    return JSON.parse(localStorage.getItem(name));
}

const formatOptions = {
    style: 'decimal',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
};


function getBrand(id) {
    const brands = getLS("brands")

    if (!brands)
        return "Error";

    const brand = brands.find(x => x.id == id)

    if (brand)
        return brand.value;

    return "Error"
}

function getGender(id) {
    const genders = getLS("genders")

    if (!genders)
        return "Error";

    const gender = genders.find(x => x.id == id)

    if (gender)
        return gender.value;

    return "Error"
}


$('#newsletter-button').on('click', () => {
    const newsletterError = $('#newsletter-error');
    const inputEmail = $('#newsletter-email');
    const reEmail = /^\w([\.-]?\w+\d*)*@\w+\.\w{2,6}$/;
    
    newsletterError.html('');
    if (!reEmail.test(inputEmail.val())) {
        newsletterError.append(`<p class="text-danger fw-bold">The email is invalid. Example: dave.johnson@gmail.com.</p>`)
    }
});


if (url.indexOf('index.html') != -1) {

    window.onload = () => {

        ajaxCallback('./genders.json', (x) => setLS("genders", x));
        ajaxCallback('./brands.json', (x) => setLS("brands", x));

        ajaxCallback('./products.json', (p) => {
            ajaxCallback('./featured.json', (f) => {
                createFeaturedProducts(p, f)
            });
        });
    };

    function createFeaturedProducts(products, featured) {

        const featuredContainer = $('#featured-products');

        for (let f of featured) {

            let p = products.find(x => x.id == f.product_id);
            if (p != null) {

                const topPrice = p.salePrice ? p.salePrice : p.price;
                const bottomPrice = p.salePrice ? p.price : p.salePrice;

                let result = `
                    <div class="col">
                    <div class="card rounded-0 shadow-sm d-flex align-items-center">
                    <div class="shoes-thumbnail-wrap">
                        <img class="shoes-thumbnail" src="${p.img.src}" alt="${p.img.alt}">
                    </div>
            
                    <div class="card-body d-flex flex-column align-items-center my-0">
                        <div class="d-flex">
                        <h4 class="fw-light mx-2">${getBrand(p.brand)}</h4>
                        <h4>${p.name}</h4>
                        </div>
                        <p class="fs-4 fw-bold text-danger mb-0">${topPrice?.toLocaleString('en-US', formatOptions)} RSD</p>
                        <p class="fs-6 fw-light strike mb-0 muted ${bottomPrice ? "visible" : "invisible"}"><s>${bottomPrice?.toLocaleString('en-US', formatOptions)} RSD</s></p>
                    </div>
                    </div>
                </div>
                `
                featuredContainer.append(result);
            }
        }
    }
}

// STORE PAGE
if (url.indexOf('store.html') != -1) {

    window.onload = () => {

        createPriceFilter('store-filters')

        ajaxCallback('./genders.json', (x) => {
            createCheckBoxList('store-filters', 'genders-cb', 'Genders', x)
            setLS("genders", x)
        });

        ajaxCallback('./brands.json', (x) => {
            createCheckBoxList('store-filters', 'brands-cb', 'Brands', x)
            setLS("brands", x)
        });

        ajaxCallback('./sort-options.json', (x) => {
            createDropDownList('store-filters', 'filter-ddl', 'Sort by', x)
            setLS("sort-options", x)
        });

        ajaxCallback('./products.json', (x) => {
            createProducts(x)
            setLS("products", x)
        });

        $("#apply-filters").on("click", onFiltersApply);
    }

    function onFiltersApply() {

        let products = getLS("products");
        products = sortProducts(products)
        products = filterBrands(products)
        products = filterGenders(products)
        products = filterSale(products)
        products = filterPrice(products)

        createProducts(products)
    }

    function createProducts(data) {

        const productsContainer = $('#store-content');
        productsContainer.html("")
        for (let el of data) {
            productsContainer.append(createProduct(el.price, el.salePrice, getBrand(el.brand), getGender(el.gender), el.name, el.img.src, el.img.alt))
        }
    }

    function createProduct(price, salePrice, brand, gender, name, imgSrc, imgAlt) {

        const topPrice = salePrice ? salePrice : price;
        const bottomPrice = salePrice ? price : salePrice;

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
                <p class="fs-5 fw-bold text-danger mb-0">${topPrice?.toLocaleString('en-US', formatOptions)} RSD</p>
                <p class="fs-7 fw-light strike mb-0 muted ${bottomPrice ? "visible" : "invisible"}"><s>${bottomPrice?.toLocaleString('en-US', formatOptions)} RSD</s></p>
            </div>
        </div>
    </div>
    `;
    }

    function createCheckBoxList(elementId, checkBoxName, label, data) {

        let result = `
            <div class="col-4">
                <div class="my-2">
                    <h5>${label}:</h5>
            `;
        for (let d of data) {
            let listElement = `
            <div class="form-check px-5">
                <input type="checkbox" class="form-check-input" name="${checkBoxName}" value='${d.value}' id="check-box-${data.id}">
                <label class="form-check-label" for="check-box-${data.id}">${d.value}</label>
            </div>
            `
            result += listElement;
        }

        result += `
                </div>
            </div>
            `

        $(`#${elementId}`).append(result);
    }

    function createDropDownList(elementId, dropDownId, label, data) {

        let result = `
        <div class="my-4">
            <h5>${label}:</h5>
            <select id="${dropDownId}" class="form-select" aria-label="Default select example">
        `;

        for (let d of data) {
            result += `<option value="${d.value}">${d.name}</option>`
        }

        result += `
                </select>
            </div>`

        $(`#${elementId}`).append(result);
    }

    function createPriceFilter(elementId) {

        let filter = `
        <div class="col-lg-4 col-md-12 mx">
        <div class="my-2">
          <h5>Price:</h5>
          <div class="input-group mb-3">
            <input type="number" class="form-control" id="price-min" placeholder="Min" aria-label="Min">
            <span class="input-group-text">-</span>
            <input type="number" class="form-control" id="price-max" placeholder="Max" aria-label="Max">
          </div>

          <div class="form-check-inline">
            <input class="form-check-input" type="radio" name="price-radio" id="price-all" value="no-sale" checked>
            <label class="form-check-label" for="price-all">
              All
            </label>
          </div>
          <div class="form-check-inline">
            <input class="form-check-input" type="radio" name="price-radio" value="on-sale" id="price-sale">
            <label class="form-check-label" for="price-sale">
              On Sale
            </label>
          </div>
        </div>
      </div>
        `

        $(`#${elementId}`).append(filter);

        $('#price-min').bind('change', () => {
            let el = $('#price-min')
            if (el.val() < 0) el.val(0)
        })

        $('#price-max').bind('change', () => {
            let el = $('#price-max')
            if (el.val() < 0) el.val(0)
        })
    }

    function getPrice(product) {
        return product.salePrice ? product.salePrice : product.price;
    }

    function sortProducts(products) {
        let sortType = $("#filter-ddl option:selected").val().toString();
        switch (sortType) {
            case "price-asc":
                return products.sort((previous, next) => getPrice(previous) > getPrice(next) ? 1 : -1)

            case "price-desc":
                return products.sort((previous, next) => getPrice(previous) < getPrice(next) ? 1 : -1)

            case "name-desc":
                return products.sort((previous, next) => previous.name < next.name ? 1 : -1)

            case "name-asc":
                return products.sort((previous, next) => previous.name > next.name ? 1 : -1)

            default:
                return products
        }
    }

    function filterBrands(products) {
        let checkedBrands = [];

        $("input[name='brands-cb']").each(function () {
            var self = $(this);
            if (self.is(':checked'))
                checkedBrands.push(self.attr("value"));
        });

        if (checkedBrands && checkedBrands.length > 0)
            products = products.filter(x => checkedBrands.includes(getBrand(x.brand)))

        return products;
    }

    function filterGenders(products) {
        let checkedGenders = [];

        $("input[name='genders-cb']").each(function () {
            var self = $(this);
            if (self.is(':checked'))
                checkedGenders.push(self.attr("value"));
        });

        if (checkedGenders && checkedGenders.length > 0)
            products = products.filter(x => checkedGenders.includes(getGender(x.gender)))


        return products;
    }

    function filterSale(products) {
        let saleStatus = $("input[name='price-radio']:checked").val()

        if (saleStatus == 'on-sale')
            products = products.filter(x => x.salePrice)

        return products;
    }

    function filterPrice(products) {
        let minPrice = $('#price-min').val()
        if (!minPrice) minPrice = 0

        let maxPrice = $('#price-max').val()
        if (!maxPrice) maxPrice = 9999999999

        return products.filter(x => {
            const price = getPrice(x)
            return price >= minPrice && price <= maxPrice
        })
    }
}

// Contact Page
if (url.indexOf('contact.html') != -1) {
    window.onload = () => {
        $('#btn-submit').on('click', processContactForm)
    }
}

function processContactForm() {

    const reName = /^(([A-ZČĆŽĐŠ][a-zčćžđš]{2,15})+)\s(([A-ZČĆŽĐŠ][a-zčćžđš]{2,15})+)$/;
    const reEmail = /^\w([\.-]?\w+\d*)*@\w+\.\w{2,6}$/;
    const reAddress = /^([a-zčćžđšA-ZČĆŽĐŠ0-9\s#-]+)\s+\d+$/;
    const reGender = /(male|female)/;
    const reTerms = /true/;
    const reQuestion = /^[A-ZČĆŽĐŠa-zčćžđš0-9]+$/

    const inputFullName = $('#full-name').val();
    const inputEmail = $('#email').val();
    const inputAddress = $('#address').val();
    const inputGender = $("input[name='gender-radio']:checked").val();
    const inputCheckTerms = $("input[name='terms-cb']").is(':checked');
    const inputQuestion = $('#question-text-area').val();

    $('#contact-form-errors').html('')
    checkReggex(reName, inputFullName, 'The name is invalid. Example: Dave Johnson.');
    checkReggex(reEmail, inputEmail, 'The email is invalid. Example: dave.johnson@gmail.com.');
    checkReggex(reAddress, inputAddress, 'The address is invalid. Street name goes first, then street number.');
    checkReggex(reGender, inputGender, 'You need to select gender.');
    checkReggex(reTerms, inputCheckTerms, 'You need to accept terms and conditions.');
    checkReggex(reQuestion, inputQuestion, 'Question can\'t be empty.');
}

function checkReggex(re, value, errorMessage) {
    if (!re.test(value)) {
        $('#contact-form-errors').append(`<li class="text-danger fw-bold mb-1">${errorMessage}</li>`)
    }
}