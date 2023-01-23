import { useState } from "preact/hooks"
import { Marmel } from "./main"

export const Radio = () => {
    const [ baseValue, setBaseValue ] = useState(true)
    
    const buttonHandler = () => {
        setBaseValue(current => !current)
    }
    
    console.log(baseValue)
    
    return (
        <div id="radioContainer">
            <div className="space"></div>
                <div id="radioMenu" >
                    <input id="satellite-v9" type="radio" name="rtoggle" value="satellite" onclick={() => buttonHandler()} />
                    <label for="satellite-v9">se</label>
                    <input id="roads" type="radio" name="rtoggle" value="roads" onclick={() => buttonHandler()} checked="checked" />
                    <label for="roads">roads</label>
                </div>              
            <div className="space"></div>
            <Marmel base={baseValue} />
        </div>         
    )
}