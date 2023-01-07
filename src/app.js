import * as React from 'react'
import { render } from 'preact';
import { useState } from 'preact/hooks';

import { Content } from './components/main'
import SwipeableTemporaryDrawer from './components/drawer';
import { Radio } from './components/radio';

const mobile = window.matchMedia( "(max-width: 600px)" );

const App = () => {

    const [ baseValue, setBaseValue ] = useState(true)
    
    const buttonHandler = () => {
        setBaseValue(current => !current)
    }
    
    console.log(baseValue)

    if (mobile.matches) {
        return (
            <div id="drawerContainer"> 
                <SwipeableTemporaryDrawer/>
            </div>
        )
    } else {
        return (
            <div>
                <div id="radioContainer">
                    <div className="space"></div>
                        <div id="radioMenu" >
                            <input id="satellite-v9" type="radio" name="rtoggle" value="satellite" onclick={() => buttonHandler()} />
                            <label for="satellite-v9">se</label>
                            <input id="roads" type="radio" name="rtoggle" value="roads" onclick={() => buttonHandler()} checked="checked" />
                            <label for="roads">roads</label>
                        </div>              
                    <div className="space"></div>
                </div>   
                <Radio />
                <Content/>
            </div>
        )
    }
}



render(<App />, document.getElementById('app'));