
var SettingsScreenController = new function(){
    var controller = this;
    
    controller.element = '.settings-screen';

    controller.load = () => {
        $('[data-view="settings-screen"]').load('assets/views/settings-screen.html', () => {
            $(controller.element+' .btn-dismiss').click(controller.toggle);
            $(controller.element+' .btn-confirm').click(controller.saveSettings);
            $(controller.element+' .theme-input').change(controller.updated);
        });
    }

    controller.loadSetting = () => {
        
        chrome.storage.sync.get(['settings'], function(result) {
            const _settings = result.settings;
            if (!_settings){
                console.log('No Settings found');
            }
            else {
                console.log('Settings found', _settings);
                $(controller.element+' .theme-input').val(_settings.theme)
            }
            $(controller.element).show();
        });
    }

    controller.saveSettings = () => {
        let settings = {
            theme: $(controller.element+' .theme-input').val()
        }
        chrome.storage.sync.set({settings: settings}, () => {
            controller.toggle();
        });
    }

    controller.updated = () => {
        let settings = {
            theme: $(controller.element+' .theme-input').val()
        }
        tools.changeTheme(settings.theme)
    }

    controller.toggle = (_flag) => {
        if ($(controller.element).is(':visible')){
            $(controller.element).hide();
        }
        else {
            controller.loadSetting();
        }
    }

    return controller;
}