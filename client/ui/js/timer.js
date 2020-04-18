$(document).ready(() => {
    $('#timer').click(function (e) {
        e.preventDefault();
        // This function will show a progress meter for
        // the specified amount of time
        if ($(this).attr('data-loading') == 'LANCER LES DES') {
            // socket lancer les dés
            $(this).addClass('disabled');
            console.log('gameRollDiceReq');
            socket.emit('gameRollDiceReq');
        }
        else {
            console.log('gameTurnEndReq');
            socket.emit('gameTurnEndReq');
            $(this).progressFinish();
        }
    });
});

// The progress meter functionality is available as a series of plugins.
// You can put this code in a separate file if you wish to keep things tidy.

(function ($) {

    // Creating a number of jQuery plugins that you can use to
    // initialize and control the progress meters.

    $.fn.progressInitialize = function () {
        // This function creates the necessary markup for the progress meter
        // and sets up a few event listeners.

        // Loop through all the buttons:

        var button = $(this),
            progress = 0;

        // Add the data attributes if they are missing from the element.
        // They are used by our CSS code to show the messages
        button.attr({ 'data-loading': 'LANCER LES DES', 'data-finished': 'EN ATTENTE' });

        // Add the needed markup for the progress bar to the button
        var bar = $('<span class="tz-bar">').appendTo(button);

        // The progress event tells the button to update the progress bar
        button.on('progress', function (e, val, absolute, finish) {

            if (!button.hasClass('in-progress')) {

                // This is the first progress event for the button (or the
                // first after it has finished in a previous run). Re-initialize
                // the progress and remove some classes that may be left.

                bar.show();
                progress = 0;
                button.removeClass('finished').addClass('in-progress')
            }

            // val, absolute and finish are event data passed by the progressIncrement
            // and progressSet methods that you can see near the end of this file.

            if (absolute) {
                progress = val;
            }
            else {
                progress += val;
            }

            if (progress >= 100) {
                progress = 100;
            }

            if (finish) {

                button.removeClass('in-progress').addClass('finished');
                console.log(button);
                bar.fadeOut(function () {
                    setProgress(0);
                });

            }

            setProgress(progress);
        });

        function setProgress(percentage) {
            bar.filter('.tz-bar').width(percentage + '%');
        }
    };

    $.fn.progressReset = function (hard = true) {
        var button = $(this);
        if (button.hasClass('disabled')) {
            button.removeClass('disabled');
        }
        if (hard) {
            button.attr({ 'data-loading': 'LANCER LES DES', 'data-finished': 'EN ATTENTE' });
        }
    }
    // progressStart simulates activity on the progress meter. Call it first,
    // if the progress is going to take a long time to finish.

    $.fn.progressStart = function(time){
      var button = this.first(),
  			last_progress = new Date().getTime();

  		if(button.hasClass('in-progress')){
  			// Don't start it a second time!
  			window.clearInterval(interval);
            button.progressSet(0);
  		}

  		button.on('progress', function(){
  			last_progress = new Date().getTime();
  		});

  		// Every half a second check whether the progress
  		// has been incremented in the last two seconds

  		var interval = window.setInterval(function(){
  			if($('.tz-bar').width() >= $('#controlButton').innerWidth())
  			{
  				button.trigger('progress-finish');
  				button.trigger('progress',[0, false, true]);
  			}
  			else{
  				// There has been no activity for two seconds. Increment the progress
  				// bar a little bit to show that something is happening
  				button.progressIncrement(100/(time/0.2));
  			}

  		}, 200);

  		button.on('progress-finish',function(){
  			window.clearInterval(interval);
  		});
  	};

    $.fn.progressFinish = function(){
        $(this).addClass('disabled');
        $(this).attr({'data-loading': 'LANCER LES DES'});
        console.log('finish');
        return this.first().progressIncrement(100);
    };

    $.fn.progressIncrement = function(val){
		var button = this.first();
        return button.trigger('progress',[val, false]);
	};

    $.fn.progressSetStateTerminer = function(){
        $(this).attr({'data-loading': 'TERMINER'});
        return this;
    };

    $.fn.progressSet = function (val) {
        val = val;
        console.log('set : ' + val);
        var finish = false;
        if (val >= 100) {
            finish = true;
        }

        return this.first().trigger('progress', [val, true, finish]);
    };


})(jQuery);
