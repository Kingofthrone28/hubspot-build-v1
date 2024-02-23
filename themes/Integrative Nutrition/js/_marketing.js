/**
 * Custom JS logic for marketing features (forms, lead capture etc).
 */

$(function () {
    console.log('test11');

    function callback(records) {
        records.forEach(function (record) {
            var list = record.addedNodes;
            var i = list.length - 1;

            for (; i > -1; i--) {
                if (list[i].nodeName.toLowerCase() === 'iframe') {
                    // Insert code here...


                    let src = $(list[i]).attr('src');
                    if (src) {
                        console.log($(list[i]).attr('src'), "srcl");
                        let params = window.location.search.substring(1);
                        let delimiter = src.indexOf('?') > 0 ? '&' : '?';
                        $(list[i]).attr('src', src + delimiter + params);
                    }
                }
            }
        });
    }

    var observer = new MutationObserver(callback);
    var targetNode = document.body;

    observer.observe(targetNode, {childList: true, subtree: true});
  
});
