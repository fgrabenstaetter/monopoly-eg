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

$('.player-list').on('mouseenter', '.property', function (e) {
    $(this).children().hide();
    var build = '';
    if (!($(this).parent().find('.blank-property').length || $(this).parent().hasClass('station') || $(this).parent().hasClass('company'))) {
        build = `<button class="minus">-</button>
                <i class="fas fa-home">1</i>
                <button class="plus">+</button>`
    }
    const html = `<div id="houseOption">`
        + build +
        `<i class="fas fa-info-circle"></i>
                </div>`
    $(this).append(html);
});

$('.player-list').on('mouseleave', '.property', function (e) {
    $(this).find('#houseOption').remove();
    $(this).children().show();
});

$('.player-list').on('click', '.minus', function (e) {
    const nbHouse = parseInt($(this).parent().find('.fa-home').text());
    if (nbHouse > 1) {
        $(this).parent().find('.fa-home').text(nbHouse - 1);
    }

    e.stopPropagation();
});

$('.player-list').on('click', '.plus', function (e) {
    const nbHouse = parseInt($(this).parent().find('.fa-home').text());
    if (nbHouse < 4) {
        $(this).parent().find('.fa-home').text(nbHouse + 1);
    }

    e.stopPropagation();
});

$('.player-list').on('click', '.popup', function (e) {
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
            <div class="blank-property"></div>
            <div class="blank-property"></div>
            <div class="blank-property"></div>
        </div>
        <div class="properties-container red">
            <div class="blank-property"></div>
            <div class="blank-property"></div>
            <div class="blank-property"></div>
        </div>
        <div class="properties-container blue">
            <div class="blank-property"></div>
            <div class="blank-property"></div>
        </div>
        <div class="properties-container orange">
            <div class="blank-property"></div>
            <div class="blank-property"></div>
            <div class="blank-property"></div>
        </div>
        <div class="properties-container purple">
            <div class="blank-property"></div>
            <div class="blank-property"></div>
            <div class="blank-property"></div>
        </div>
        <div class="properties-container brown">
            <div class="blank-property"></div>
            <div class="blank-property"></div>
        </div>
        <div class="properties-container cyan">
            <div class="blank-property"></div>
            <div class="blank-property"></div>
            <div class="blank-property"></div>
        </div>
        <div class="properties-container green">
            <div class="blank-property"></div>
            <div class="blank-property"></div>
            <div class="blank-property"></div>
        </div>
        <div class="properties-container station">
            <div class="blank-property"></div>
            <div class="blank-property"></div>
            <div class="blank-property"></div>
            <div class="blank-property"></div>
        </div>
        <div class="properties-container company">
            <div class="blank-property"></div>
            <div class="blank-property"></div>
        </div>
    `;
    $('.popup').each(function () {
        $(this).prepend(html);
    });
}

function createProperty(playerID, type, roadName, roadID) {
    const roadHtml = `<div>` + roadName + `</div>`
    if (roadName == "Syndicat Des Eaux et de l'Assainissement") {
        html = `<div class="property eau" data-id="` + roadID + `">`
            + roadHtml +
            `</div>`;
    }
    else if (roadName == 'Eléctricité de Strasbourg') {
        html = `<div class="property electricite" data-id="` + roadID + `">`
            + roadHtml +
            `</div>`;
    }
    else {
        html = `<div class="property" data-id="` + roadID + `">`
            + roadHtml +
            `</div>`;
    }
    $('.player-entry[data-id="' + playerID + '"]').find('.' + type).find('.blank-property').first().remove();;
    $('.player-entry[data-id="' + playerID + '"]').find('.' + type).prepend(html);
    $('.player-entry[data-id="' + playerID + '"]').find('.' + type).show();
}

function delProperty(roadID) {
    html = '<div class="blank-property"></div>';
    $('.property[data-id="' + roadID + '"]').parent().append(html);
    $('.property[data-id="' + roadID + '"]').remove();

    $('.properties-container').each(function () {
        if (!($('.property', this).length > 0)) {
            $(this).hide();
        }
    });
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

function createUpgradeCard(propertyID, type, roadName, disabled) {
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
 * @param {int} startingprice prix minimal de l'enchère si déclenchée par un eutre joueur
 */
function openBidPopup(id, playername, streetname, startingprice) {
    if (playername == "undefined") {
        var html =
            `<div class="bid-popup" data-bidID="` + id + `">
            <div class="bid-form">
                <div class="content">Une enchère est lancée pour ` + streetname + `</div>
                <div class="bid-input">
                    <input type="text" placeholder="Prix"></input>€
                    <button disabled='disabled' class="bid-validation" onclick="validateBid(` + id + `)">Enchérir</button>
                    <button class="bid-cancel">Passer</button>
                </div>
            </div>
        </div>`;
    }
    else {
        var html =
            `<div class="bid-popup" data-bidID="` + id + `">
            <div class="bid-form">
                <div class="content">` + playername + ` lance une enchère pour ` + streetname + `. Prix de départ : ` + startingprice + `</div>
                <div class="bid-input">
                    <input type="text" placeholder="Prix"></input>€
                    <button disabled='disabled' class="bid-validation" onclick="validateBid(` + id + `)">Enchérir</button>
                    <button class="bid-cancel">Passer</button>
                </div>
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

/**
 * Ajoute un message d'information à une popup d'enchères
 * @param {*} id id de la popup
 * @param {*} message message à afficher
 */
function addBidInfo(id, message) {
    var html = `<div class="bid-info">` + message + `</div>`;
    $('*[data-bidID="' + id + '"]').append(html);
}

/**
 * Active ou désactive le bouton "enchérir" en fonction de l'input
 */
$('#bid-popup-container').on('keyup', '.bid-input input', function (e) {
    let empty = false;

    empty = $(this).val().length == 0;

    if (empty)
        $(this).parent().find('.bid-validation').attr('disabled', 'disabled');
    else
        $(this).parent().find('.bid-validation').attr('disabled', false);
});