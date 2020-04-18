$(document).ready(function () {
    $('.popup').hide();
})

$('.player-list').on('click', '.player-entry', function (e) {
    const popup = $(this).find('.popup');
    if (popup.is(':visible')) {
        popup.toggle();
    }
    else {
        $('.popup').hide();
        popup.show();
    }
    e.stopPropagation();
});

$(document).on('click', function (e) {
    var container = $(".popup");
    var oc = $(".overview-card");
    if (!container.is(e.target) && container.has(e.target).length === 0) {
        container.hide();
        oc.hide();
    }
});

function initProperty() {
    const html = `
        <div class="properties-container yellow">
        </div>
        <div class="properties-container red">
        </div>
        <div class="properties-container blue">
        </div>
        <div class="properties-container orange">
        </div>
        <div class="properties-container purple">
        </div>
        <div class="properties-container brown">
        </div>
        <div class="properties-container cyan">
        </div>
        <div class="properties-container green">
        </div>
        <div class="properties-container station">
        </div>
        <div class="properties-container company">
        </div>
    `;
    $('.popup').each(function () {
        $(this).prepend(html);
    });
}

function createProperty(playerID, type, roadName, roadID) {
    if (roadName == "Syndicat Des Eaux et de l'Assainissement") {
        html = `<div class="property eau" data-id="` + roadID + `">`
            + roadName +
            `</div>`;
    }
    else if (roadName == 'Eléctricité de Strasbourg') {
        html = `<div class="property electricite" data-id="` + roadID + `">`
            + roadName +
            `</div>`;
    }
    else {
        html = `<div class="property" data-id="` + roadID + `">`
            + roadName +
            `</div>`;
    }
    $('.player-entry[data-id="' + playerID + '"]').find('.' + type).append(html);
}


function delProperty(roadID) {
    $('.property[data-id="' + roadID + '"]').remove();
}

function createSaleCard(propertyID, type, roadName, price, disabled) {
    let newType;
    if (type == 'company') {
        if (roadName == "Syndicat Des Eaux et de l'Assainissement") {
            newType = 'company eau';
        } else if (roadName == 'Eléctricité de Strasbourg') {
            newType = 'company electricite';
        }
    } else {
        newType = type;
    }

    let html = `<div class="card notification sale` + (disabled ? ' disabled' : '') + `" data-property-id="` + propertyID + `" style="display: none;">
                    <div class="card-header ` + newType + `">
                        <div class="title">` + roadName + `</div>
                    </div>
                    <div class="card-body">
                        <div class="row">
                            <div class="col-md-12 text-center value">
                                <p class="state">À VENDRE</p>
                                <p>` + price + `€</p>
                            </div>
                        </div>
                        <button class="btn btn-primary` + (disabled ? '' : ' accept') + `">ACHETER</button>
                        <button class="btn btn-secondary` + (disabled ? '' : ' reject') + `"">NE RIEN FAIRE</button>
                    </div>
                </div>`;

    $(html).appendTo('.notification-container > .col-md-12').fadeIn('fast');
}

function createUpgradeCard(propertyID, type, roadName, price, disabled) {
    let newType;
    if (type == 'company') {
        if (roadName == 'Eau') {
            newType = 'company eau';
        }
        else if (roadName == 'Électricité') {
            newType = 'company electricite';
        }
    }
    else {
        newType = type;
    }

    let html = `<div class="card notification upgrade` + (disabled ? ' disabled' : '') + `" data-property-id="` + propertyID + `" style="display: none;">
                    <div class="card-header ` + newType + `">
                        <div class="title">` + roadName + `</div>
                    </div>
                    <div class="card-body">
                        <div class="row">
                            <div class="col-md-12 text-center value">
                                <p class="state">AMÉLIORER</p>
                                <p>Vous pouvez améliorer votre propriété :</p>
                                <input class="property-upgrade-level" value="` + propertyLevel + `" type="number">
                            </div>
                        </div>
                        <button class="btn btn-primary` + (disabled ? '' : ' accept') + `">AMELIORER</button>
                        <button class="btn btn-secondary` + (disabled ? '' : ' reject') + `"">NE RIEN FAIRE</button>
                    </div>
                </div>`;

    $(html).appendTo('.notification-container > .col-md-12').fadeIn('fast');
}

function createTextCard(text, disabled, type, title) {
    let html;
    if (title == undefined) {
        html = `<div class="card notification event ` + (disabled ? ' disabled' : '') + `" style="display: none;">
                    <div class="card-body no-header">
                        <div class="col-md-12 text-center value">
                            <p>` + text + `</p>
                        </div>
                        ` + (disabled ? '' : '<button class="btn btn-primary reject">OK</button>') + `
                    </div>
                </div>`;
    } else {
        html = `<div class="card notification event ` + (disabled ? ' disabled' : '') + `" style="display: none;">
                    <div class="card-header ` + type + `">
                        <div class="title">` + title + `</div>
                    </div>
                    <div class="card-body">
                        <div class="col-md-12 text-center value">
                            <p>` + text + `</p>
                        </div>
                        ` + (disabled ? '' : '<button class="btn btn-primary reject">OK</button>') + `
                    </div>
                </div>`;
    }

    $(html).appendTo('.notification-container > .col-md-12').fadeIn('fast');
}

/**
 * Génère une popup pour la gestion d'une enchère
 * @param {int} id id de la popup d'enchère !DOIT ÊTRE UNIQUE!
 * @param {string} playername nom du vendeur
 * @param {string} streetname nom de la rue mise en enchères
 */
function openBidPopup(id, playername, streetname) {
    if (playername == "undefined") {
        var html =
        `<div class="bid-popup" data-bidID="` + id + `">
            <div class="content">Une enchère est lancée pour ` + streetname + `</div>
            <div class="bid-input">
                <input class="bid-input" type="text" placeholder="Entrez votre prix ici..."></input>
                <button class="bid-validation" onclick="validateBid(` + id + `)">Valider</button>
            </div>
        </div>`;
    }
    else {
        var html =
        `<div class="bid-popup" data-bidID="` + id + `">
            <div class="content">` + playername + ` lance une enchère pour ` + streetname + `</div>
            <div class="bid-input">
                <input class="bid-input" type="text" placeholder="Entrez votre prix ici..."></input>
                <button class="bid-validation" onclick="validateBid(` + id + `)">Valider</button>
            </div>
        </div>`;
    }

    $(html).prependTo('#bid-popup-container').fadeIn(500);
}

/**
 * Valide la saisie
 * @param {int} id id de la popup d'enchère à valider
 */
function validateBid(id) {
    $('*[data-bidID="' + id + '"]').find('input').prop('disabled', true);
}

/**
 * Ferme la popup possèdant l'identifiant id
 * @param {int} id id de la popup d'enchère à fermer
 */
function closeBidPopup(id) {
    $('*[data-bidID="' + id + '"]').fadeOut(500, function () { $(this).remove(); });
}
