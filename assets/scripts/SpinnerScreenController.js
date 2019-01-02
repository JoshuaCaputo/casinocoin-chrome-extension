let SpinnerScreenController = new function(){
    var scope = this;
    this.element = '.spinner-screen';
    this.load = function(){
        $('[data-view="spinner-screen"]').load('assets/views/spinner-screen.html');
    }
    this.changeTitle = function(_text){
        $('.spinner-title').html(_text)
    }
    this.changeDescription = function(_text){
        $('.spinner-desc').html(_text)
    }
    this.change = function(_title, _desc){
        scope.changeTitle(_title);
        scope.changeDescription(_desc);
    }
    this.present = function(_options){
        if (_options){
            scope.change(_options[0], _options[1]);
        }
        $(scope.element).show();
    }
}