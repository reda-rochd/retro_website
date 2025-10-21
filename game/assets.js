import { fennSpritesMetadata } from './fennSpritesMetadata.js';
import { marcelineSpritesMetadata } from './marcelineSpritesMetadata.js';

function assetManager()
{
    let assets = {};
    let assetPromises = [];

    let addAsset = async function(name, src) {
        let img = new Image();
        let promise = new Promise((resolve, reject) => {
            img.onload = () => {
                assets[name] = img;
                resolve();
            };
            img.onerror = reject;
        });
        img.src = src;
        assetPromises.push(promise);
    }

    let loadAssets = async function() {    
        await Promise.all(assetPromises);
    }

    let getAsset = function(name) {
        return assets[name];
    }
    return {
        load: loadAssets,
        add: addAsset,
        get: getAsset
    };
}

let assetsManager = () => {
    let manager = assetManager();
    for(let key in fennSpritesMetadata) {
        manager.add(key, fennSpritesMetadata[key].path);
    }
    
    for(let key in marcelineSpritesMetadata) {
        manager.add(key, marcelineSpritesMetadata[key].path);
    }
    // Hp bar assets
    manager.add('hp_bar', 'assets/ui/hp_bar.png');

    // Background assets
    manager.add('sky', 'assets/background/sky.png');
    manager.add('mountains', 'assets/background/mountains.png');
    manager.add('trees', 'assets/background/trees.png');
    manager.add('grass', 'assets/background/grass.png');
    manager.add('billboard', 'assets/background/billboard.png');
    manager.add('ground', 'assets/background/ground.png');
    return manager;
};

export { assetsManager };