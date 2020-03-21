$(document).ready(function () {
    $('.popup').hide();
})

$('.player-entry').click(function () {
    const popup = $(this).find('.popup');
    if (popup.is(':visible')) {
        popup.toggle();
    }
    else {
        $('.popup').hide();
        popup.show();
    }
});

function initProperty(){
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
    $('.popup').each(function(){
        $(this).append(html);
    });
}

function createProperty(playerID, type, roadName, roadID){
    if (roadName == 'Eau') {
        html =  `<div class="property eau data-id="` + roadID + `">`
                    + roadName +
                `</div>`;
    }
    else if (roadName == 'Électricité') {
        html =  `<div class="property electricite" data-id="` + roadID + `">`
                    + roadName +
                `</div>`;
    }
    else {
        html =  `<div class="property" data-id="` + roadID + `">`
                    + roadName +
                `</div>`;
    }
    $('.player-entry[data-id = "' + playerID + '"]').find('.' + type).append(html);
}


function delProperty(roadID){
    $('.property[data-id = "' + roadID + '"]').remove();
}

function createCard(type, roadName, price){
    html =  `<div class="card notification sale">
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
    $('.notification-container > .col-md-12').append(html);

    //Nécessaire?
    $('.btn-primary').unbind();
    $('.btn-secondary').unbind();

    $('.btn-primary').click(function () {
        let error = 0;
        let status;
        alert('gamePropertyBuyReq a implementer');
        console.log('gamePropertyBuyReq');

        if (!error) {
            $(this).parent().parent().remove();
        }
        else {
            console.log('erreur :' + status);
        }
    });


    $('.btn-secondary').click(function () {
        $(this).parent().parent().remove();
    });
}

initProperty()
createProperty('1', 'yellow', 'Avenue des Vosges', 2);
createProperty('1', 'yellow', 'Rue de la rue', 3);
createProperty('3', 'red', 'Avenue des Vosges', 4);
createProperty('1', 'blue', 'Avenue originale', 5);
createProperty('1', 'blue', 'Rue de la forêt', 1);
createProperty('2', 'blue', 'Rue de la ville', 8);
createProperty('1', 'blue', 'Rue étrange', 9);
createProperty('1', 'station', 'Université', 10);
createProperty('1', 'station', 'Homme de Fer', 12);
createProperty('1', 'company', 'Eau', 15);
createProperty('1', 'company', 'Électricité', 20);
createProperty('6', 'orange', 'Avenue des Vosges', 21);
createProperty('1', 'pink', 'Rue de la rue', 32);
createProperty('1', 'cyan', 'Avenue des Vosges', 23);
createProperty('4', 'green', 'Avenue originale', 22);
createProperty('4', 'green', 'Rue de la forêt', 31);
createProperty('4', 'brown', 'Rue de la ville', 33);

createCard('brown', 'Rue de la ville', 33000);
