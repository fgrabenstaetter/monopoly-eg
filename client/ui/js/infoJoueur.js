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
    html = `<div class="property">
                ` + roadName + `
            </div>`;
    $('[data-id = "' + playerID + '"]').find('.' + type).append(html);

}

initProperty()
createProperty('1', 'yellow', 'Avenue des Vosges');
createProperty('1', 'yellow', 'Rue de la rue');
createProperty('1', 'red', 'Avenue des Vosges');
createProperty('1', 'blue', 'Avenue originale');
createProperty('1', 'blue', 'Rue de la forêt');
createProperty('1', 'blue', 'Rue de la ville');
createProperty('1', 'blue', 'Rue étrange');
