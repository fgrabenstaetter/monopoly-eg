$(document).ready(function () {
    $('.popup').hide();
})

$('.player-list').on('click', '.player-entry', function () {
    const popup = $(this).find('.popup');
    if (popup.is(':visible')) {
        popup.toggle();
    }
    else {
        $('.popup').hide();
        popup.show();
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
        <div class="properties-container pink">
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
    if (roadName == 'Eau') {
        html = `<div class="property eau data-id="` + roadID + `">`
            + roadName +
            `</div>`;
    }
    else if (roadName == 'Électricité') {
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

function createCard(propertyID, type, roadName, price) {
    let html = `<div class="card notification sale" data-property-id="` + propertyID + `" style="display: none;">
                    <div class="card-header ` + type + `">
                        <div class="title">` + roadName + `</div>
                    </div>
                    <div class="card-body">
                        <div class="row">
                            <div class="col-md-12 text-center value">
                                <p class="state">À VENDRE</p>
                                <p>` + price + `€</p>
                            </div>
                        </div>
                        <button class="btn btn-primary accept">ACHETER</button>
                        <button class="btn btn-secondary reject">NE RIEN FAIRE</button>
                    </div>
                </div>`;

    $(html).appendTo('.notification-container > .col-md-12').fadeIn('fast');
}

function createDisabledCard(propertyID, type, roadName, price) {
    let html = `<div class="card notification sale disabled" data-property-id="` + propertyID + `" style="display: none;">
                <div class="card-header ` + type + `">
                    <div class="title">` + roadName + `</div>
                </div>
                <div class="card-body">
                    <div class="row">
                        <div class="col-md-12 text-center value">
                            <p class="state">À VENDRE</p>
                            <p>` + price + `€</p>
                        </div>
                    </div>
                    <button class="btn btn-primary">ACHETER</button>
                    <button class="btn btn-secondary">NE RIEN FAIRE</button>
                </div>
            </div>`;

    $(html).appendTo('.notification-container > .col-md-12').fadeIn('fast');
}

function createTextCard(text, disabled=false, type, title) {
    let html;
    if (title == undefined) {
        html = `<div class="card notification event ` + (disabled ? ' disabled' : '') + `" style="display: none;">
                    <div class="card-body no-header">
                        <div class="col-md-12 text-center value">
                            <p>` + text + `</p>
                        </div>
                        <button class="btn btn-primary reject">OK</button>
                    </div>
                </div>`;
    }
    else {
        html = `<div class="card notification event ` + (disabled ? ' disabled' : '') + `" style="display: none;">
                    <div class="card-header ` + type + `">
                        <div class="title">` + title + `</div>
                    </div>
                    <div class="card-body">
                        <div class="col-md-12 text-center value">
                            <p>` + text + `</p>
                        </div>
                        <button class="btn btn-primary reject">OK</button>
                    </div>
                </div>`;
    }
    console.log(html);
    $(html).appendTo('.notification-container > .col-md-12').fadeIn('fast');
}

// initProperty()
// createProperty('1', 'yellow', 'Avenue des Vosges', 2);
// createProperty('1', 'yellow', 'Rue de la rue', 3);
// createProperty('3', 'red', 'Avenue des Vosges', 4);
// createProperty('1', 'blue', 'Avenue originale', 5);
// createProperty('1', 'blue', 'Rue de la forêt', 1);
// createProperty('2', 'blue', 'Rue de la ville', 8);
// createProperty('1', 'blue', 'Rue étrange', 9);
// createProperty('1', 'station', 'Université', 10);
// createProperty('1', 'station', 'Homme de Fer', 12);
// createProperty('1', 'company', 'Eau', 15);
// createProperty('1', 'company', 'Électricité', 20);
// createProperty('6', 'orange', 'Avenue des Vosges', 21);
// createProperty('1', 'pink', 'Rue de la rue', 32);
// createProperty('1', 'cyan', 'Avenue des Vosges', 23);
// createProperty('4', 'green', 'Avenue originale', 22);
// createProperty('4', 'green', 'Rue de la forêt', 31);
// createProperty('4', 'brown', 'Rue de la ville', 33);

//createCard(1, 'brown', 'Rue de la ville', 33000, null);
//createTextCard('Vous êtes arrivés sur l\'Avenue des Vosges\nVous devez versé un loyer de 30 000€ à X', false, 'red', 'LOYER');
//createTextCard('Vous devez allez en prison.', true, 'event', 'CHANCE');
//createTextCard('qqch');
