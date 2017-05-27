var Common = (function() {
    'use strict';
    return {
        scrollTo: function(element, speed) {
            element = element || 'html,body';
            speed = speed || 'slow';
            $('html,body').animate({
                    scrollTop: $(element).offset().top
                },
                speed);
        }
    };
})();