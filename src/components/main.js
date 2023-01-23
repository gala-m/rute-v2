import * as React from 'react'
import { useState } from 'preact/hooks';

import rute from '../../icons/rute.svg'
import bus from '../../icons/bus.png'

import { routes } from './data'
import { ranks } from './data'

const CACHE_TIME = 24 * 60;
mapboxgl.accessToken = process.env.mapbox;

let welcomeMessage;
if (localStorage.getItem("firstTime") == null) {
    welcomeMessage = <div id="welcome" >
                        <div>
                            <span id='close' style="top: 0px; cursor: pointer;" onclick={() => {closeWelcome(); return false;}}>x</span>  
                            <div>Welcome to Rute Map. Click on a kombie route below to get started. </div>                            
                        </div>
                    </div>
    localStorage.setItem("firstTime","done");
}

function closeWelcome() {
    document.getElementById('welcome').style.display = 'none';
}

const desktop = window.matchMedia( "(min-width: 601px)" );

const map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/winniatthepark/ckxybpudc70p014tl0v5b7j5d',
    center: [25.90816497802734, -24.65559807941307],
    zoom: 12
});

map.addControl(new mapboxgl.NavigationControl());
map.addControl(new mapboxgl.GeolocateControl({
    positionOptions: {
        enableHighAccuracy: true
    },
    trackUserLocation: false,
    showUserHeading: true
}));

map.on('mouseenter', 'routesLayer', (e) => {
    map.getCanvas().style.cursor = 'pointer';
    
    const name = e.features[0].properties.name
    map.setFilter('routesText', ['==', ['get', 'name'], name]);
    map.setLayoutProperty('routesText', 'visibility', 'visible');
});
 
map.on('mouseleave', 'routesLayer', () => {
    map.getCanvas().style.cursor = '';
});

const routesArray = []
const ranksArray = []

var azSorter = [];
var az = []; 

function arrayPusher(it, arr) {
    for (const val of it) {
        arr.push(val)
    }
}

function setRoads() {
    map.setStyle('mapbox://styles/winniatthepark/ckxybpudc70p014tl0v5b7j5d')
    location.reload()
}

function setSatellite() {
    map.setStyle('mapbox://styles/mapbox/satellite-v9')
    map.on('style.load', () => {
            map.getLayer('points')
    })
}

export const Content = () => {
    
    const [ prevSelect, setPrevSelect ] = useState(null);
    const [ routeView, setRouteView ] = useState(null);
    const [ rank1, setRank1 ] = useState("");
    const [ rank2, setRank2 ] = useState("");
    const [ complete, setComplete] = useState(true);
    const [ component, setComponent ] = useState("0");
    const [ report, setReport ] = useState("")
    const [ OneBarName, SetOneBarName ] = useState("")

    const onLoad = async () => {

        const dataPath = 'http://gettingstartedapp-env.eba-brgmuyqm.us-east-1.elasticbeanstalk.com/data/';
        const routesPath = dataPath + 'routes3';
        const stopsPath = dataPath + 'points';
        const ranksPath = dataPath + 'ranks'
        // const rankPointsPath = dataPath + 'rankpoints'

        const fetchRoutes = fetchCache(routesPath, CACHE_TIME);
        const fetchStops = fetchCache(stopsPath, CACHE_TIME)   
        const fetchRanks = fetchCache(ranksPath, CACHE_TIME) 
        //const fetchRankPoints = fetchCache(rankPointsPath, CACHE_TIME) 
        
        if (Object.keys(allRankPoints).length < 1) {

            $.extend(allStops, {
                stops: await fetchStops
            });

            $.extend(allRoutes, {
                routes: await fetchRoutes
            });

            $.extend(allRanks, {
                ranks: await fetchRanks
            });
            /*
            $.extend(allRankPoints, {
                rankPoints: await fetchRankPoints
            });
            */

            const rawRoutes = allRoutes.routes.features
            const iterator = rawRoutes.values();

            const rawRanks = ranks.features
            const iterator2 = rawRanks.values();

            arrayPusher(iterator, routesArray)
            arrayPusher(iterator2, ranksArray)

            const OutRoutes = routesArray.filter(element => element.properties.direction === "Out")

            const iterator3 = OutRoutes.values();

            for (const value of iterator3) {
                azSorter.push(value.properties.name)
            }

            azSorter.sort()

            var current_number='1'

            for (var i = 0; i < azSorter.length; i++) {
                if(azSorter[i].charAt(0)!=current_number){
                    az.push(azSorter[i])
                }
            } 
        }
    }

    map.on('load', async () => {
        onLoad()
        addSourcesToMap()
        addLayersToMap()
        changeComponent("1")
    })

    function addSourcesToMap() {

        map.addSource('points', {
            'type': 'vector',
            'url': 'mapbox://winniatthepark.6zlrljya'
        }); 

        map.addSource('routes', {
            'type': 'geojson',
            'data': routes, 
            lineMetrics: true,
        });    

        map.addSource('ranks', {
            'type': 'geojson',
            'data': ranks, 
        });    
    }

    function addLayersToMap() {
        map.addLayer({
            'id': 'points',
            'source': 'points',
            'source-layer': 'stops-0oxq5k',
            'type': 'circle',
            'paint': {
                'circle-radius': ['interpolate', ['linear'], ['zoom'], 7, 1, 15, 5],
                'circle-color': '#0b1e57', 
                'circle-stroke-width': 1,
                'circle-stroke-color': '#fff'
            }                    
        });    
        
        map.addLayer({
            'id': 'routesLayer',
            'type': 'line',
            'source': 'routes',
            'layout': {
                'line-cap': 'round',  
                'visibility': 'none'          
            },
            'paint': {
                'line-color': '#07143b',
                'line-width': 2,
                'line-gradient': [
                    'interpolate',
                    ['linear'],
                    ['line-progress'],
                    0,
                    '#07143b',
                    1,
                    '#7f0f2f',
                ],
            }
        });
        
        map.addLayer({
            'id': 'routesText',
            'type': 'symbol',
            'source': 'routes',
            'paint': {
                'text-halo-width': 2,
                'text-halo-color': '#ffffff',
                'icon-opacity': 0                   
            },
            'layout': {
                'icon-image': "rbus",
                'icon-size': 0.2,
                'icon-offset': [20,-20],
                'text-field': ['get', 'name'], 
                'text-font': ['DIN Pro Regular'],
                'visibility': 'none' 
            }
        }); 

        map.addLayer({
            'id': 'ranksLayer',
            'type': 'fill',
            'source': 'ranks',
            'paint': {
                'fill-color': '#7f0f2f',
                'fill-antialias': true,
                'fill-outline-color': '#ffffff',
                'fill-opacity': 0.3
            } 
        }); 

        map.addLayer({
            'id': 'text',
            'type': 'symbol',
            'source': 'ranks',
            'paint': {
                'text-halo-width': 2,
                'text-halo-color': '#ffffff'                    
            },
            'layout': {
                'icon-image': "rbus",
                'icon-size': 0.2,
                'icon-offset': [20,-20],
                'text-field': ['get', 'rank'], 
                'text-anchor': 'bottom-left',
                'text-offset': [1.5,-0.6],
                'text-font': ['DIN Pro Regular'],
                'visibility': 'none' 
            }
        });  
    }

    const tipRadio = (
        <div id="radioContainer">
            <div className="space"></div>
                <div id="radioMenu" >
                    <input id="satellite-v9" type="radio" name="rtoggle" value="satellite" onclick={() => setSatellite()} />
                    <label for="satellite-v9">satellite</label>
                    <input id="roads" type="radio" name="rtoggle" value="roads" onclick={() => setRoads()} checked="checked" />
                    <label for="roads">roads</label>
                </div>              
            <div className="space"></div>
        </div>   
    ) 

    const routeInfo = (element) => {
        return (
            <div>
                <div class="routeInfo">
                    <br/>
                    <div>
                        <img alt='busrankicon' src={bus} class="rankicon" />
                        Loads at <br/>{rank1}   <i class="fas fa-exchange-alt"></i>   {rank2}</div>
                    <br/>
                    <div class='actionContainer' >{ complete ? 
                        <button class='viewRouteAction' onClick={() => {setReport('The problem with ' + element + ' is' ); changeComponent("2")}} >
                            Is this route incorrect? 
                            <div class="actionButton">
                                Report it <i class="fas fa-flag"></i>
                            </div>
                        </button> 
                        : 
                        <div>
                            This route is incomplete.
                            <br /><br />
                            <button class='actionButton' style={"padding: 25px"} onClick={() => changeComponent("2")} >
                                Add to it <i class="fas fa-pen fa-beat-fade fa-2xl" style="--fa-beat-fade-opacity: 0.67; --fa-beat-fade-scale: 1.1" ></i>
                            </button>
                        </div> }
                    </div> 
                </div>
            </div>
        )
    }

    const RouteList = az.map((element, i) => 
        
        (   
            <div name="barHolder" className="barHolder">
                <div className="bar" key={element} id={element} onClick={() => clickedRoute(element, i)} > 
                    <div>{element}</div>
                        { element === routeView && (
                            routeInfo(element) 
                        )}
                </div>            
            </div> 
        )
    )

    function allRoutes() {
        
        return (
            <div id="routeList">
                <div>{ tipRadio }</div>
                <div className="bar" onClick={() => clickedAll()} >All Routes</div>
                <div>{ RouteList }</div>
                            
            </div>
        )
    }

    function clickedAll() {
        map.setFilter('routesLayer', null);
        map.setLayoutProperty('routesLayer', 'visibility', 'visible');
        map.moveLayer('routesLayer', 'points');
    }

    function reset() {
        document.getElementById(prevSelect).style.cursor = 'pointer'
        document.getElementById(prevSelect).style.borderLeft = 'none rgba(252, 251, 249, 0)'
    }

    map.on('click', 'routesLayer', (e) => {
        const name = e.features[0].properties.name
        console.log(name)
        clickedRoute(name)
    })

    const clickedRoute = (name) => {
        
        if (prevSelect != null) {
            reset()
        }

        setRouteView(name)

        document.getElementById(name).style.borderLeft = 'solid #040b21'
        document.getElementById(name).style.cursor = 'auto'

        const matchedRoute = routesArray.filter(element => element.properties.name === name)

        const statusFinder = matchedRoute[0].properties.status

        if (statusFinder === "Complete") {
            setComplete(true)
        } else {
            setComplete(false)
        }

        const array = matchedRoute[0].geometry.coordinates
        const coord1 = matchedRoute[0].geometry.coordinates[0]
        const lastCoord = array.length - 1;
        const coord2 = matchedRoute[0].geometry.coordinates[lastCoord]

        map.setFilter('routesLayer', ['==', ['get', 'name'], name]);
        map.setLayoutProperty('routesLayer', 'visibility', 'visible');
        map.moveLayer('routesLayer', 'points');

        map.easeTo({
            center: coord1,
            speed: 1,
            curve: 1,
            easing(t) {
                return t;
            }
        });

        map.fitBounds([coord1, coord2], {
            padding: { left: 400, right: 200, top: 100, bottom: 100 }
        });

        setPrevSelect(name)

        const matchedRank = ranksArray.filter(element => element.properties.name.includes(name))

        const layerArray = ['text', 'ranksLayer'];

        if (matchedRank.length === 2) {
            setRank1(matchedRank[0].properties.rank)
            setRank2(matchedRank[1].properties.rank)

            layerArray.forEach(element => {
                map.setFilter(element, ["any", 
                    ['==', ['get', 'name'],  matchedRank[0].properties.name],
                    ['==', ['get', 'name'],  matchedRank[1].properties.name] 
                ]);  
            });          

        } else {
            setRank1(matchedRank[0].properties.rank)
            setRank2('') 

            layerArray.forEach(element => {
                map.setFilter(element, ["any", 
                    ['==', ['get', 'name'],  matchedRank[0].properties.name]
                ]);  
            });  
                      
        }

        map.setLayoutProperty('text', 'visibility', 'visible');
        map.setPaintProperty('ranksLayer', 'fill-opacity', 0.8);   

        if (desktop.matches) {
            null
        } else {
            SetOneBarName(name) 
            changeComponent("3")     
        }      
    }  

    const Contact = () => {
        return (
            <div>
                <button id="back" class="navButton" onClick={() => changeComponent("1")}>
                    x
                </button>              
                <form id="form-contact" onSubmit={event.preventDefault()} name="form-contact" method="POST" data-netlify="true" class="netlify-form">
                    <input type="hidden" name="form-name" value="form-contact" />
                    <h3>Get in touch</h3>
                    here or at rutemap@outlook.com to report problems or suggest new features. 
                    <br/>
                    <br/>
                    <input type="text" name="name" placeholder="Name" class="input"/> 
                    <br/>
                    <input type="text" name="email" placeholder="Email" class="input"/> 
                    <br/>
                    <textarea  type="text" name="message" id="message" rows="4" value={report} placeholder="Message" class="input"></textarea>
                    <br/>
                    <button type="submit" class="button">Send</button>
                </form>    
            </div>
        )
    }

    const OneBar = (element) => {
        return (
            <div>
                <div className="bar"> 
                { OneBarName }
                <button id="back" class="navButton" onClick={() => changeComponent("1")}>
                    x
                </button>     
                    { OneBarName === routeView && (
                        routeInfo(element) 
                    ) }
                </div>
            </div>
        )
    }


    const Loading = () => {
        return <div class="loading" ><i class="fas fa-circle-notch fa-spin fa-2xl"></i></div>
    }

    let toberendered;

    if (component === '0') {
        toberendered = Loading()
    } else if (component === "1") {
        toberendered = allRoutes()
    } else if (component === "2") {
        toberendered = Contact()
    } else if (component == "3") {
        toberendered = OneBar(OneBarName)
    }

    function changeComponent(number) {
        setComponent(number); 
    }

    return (
        <div>
            <div id="container-background">
                <svg height="0">
                <mask id="mask-1">
                    <linearGradient id="gradient-1" y2="1.5">
                    <stop stop-color="white" offset="0.1"/>
                    <stop stop-opacity="0.1" offset="0.9"/>
                    </linearGradient>
                    <rect x="0.1" y="0.5" width="800" height="3500" fill="url(#gradient-1)"/>
                </mask>
                </svg>
            </div>
            <div id="container">
                { desktop.matches && (
                    <img alt='logo' src={rute} className='logo' />
                )}
                <div>{welcomeMessage}</div>
                <div id="content" >{toberendered}</div>
                <button id="mail" class="navButton" onClick={() => changeComponent("2")}>
                    <i class="fa-solid fa-envelope fa-xl fa-inverse" style="margin: auto;padding: 45%;padding-top: 0px; padding-bottom: 0px; color: #0b1e57;"></i>
                </button>
            </div>            
        </div>
    )
}
