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

function createProperty(playerID, type, roadName){
    if (roadName == 'Eau') {
        html = `<div class="property eau">
            ` + roadName + `
        </div>`;
    }
    else if (roadName == 'Électricité') {
        html = `<div class="property electricite">
            ` + roadName + `
        </div>`;
    }
    else {
        html = `<div class="property">
            ` + roadName + `
        </div>`;
    }
    $('[data-id = "' + playerID + '"]').find('.' + type).append(html);
}

initProperty()
createProperty('1', 'yellow', 'Avenue des Vosges');
createProperty('1', 'yellow', 'Rue de la rue');
createProperty('3', 'red', 'Avenue des Vosges');
createProperty('1', 'blue', 'Avenue originale');
createProperty('1', 'blue', 'Rue de la forêt');
createProperty('2', 'blue', 'Rue de la ville');
createProperty('1', 'blue', 'Rue étrange');
createProperty('1', 'station', 'Université');
createProperty('1', 'station', 'Homme de Fer');
createProperty('1', 'company', 'Eau');
createProperty('1', 'company', 'Électricité');
createProperty('6', 'orange', 'Avenue des Vosges');
createProperty('1', 'pink', 'Rue de la rue');
createProperty('1', 'cyan', 'Avenue des Vosges');
createProperty('4', 'green', 'Avenue originale');
createProperty('4', 'green', 'Rue de la forêt');
createProperty('4', 'brown', 'Rue de la ville');