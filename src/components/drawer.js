import * as React from 'preact'
import { useState } from 'preact/hooks';

import { Global } from '@emotion/react';
import Drawer from '@mui/material/Drawer'

import { Content } from './main'
import rute from '../../icons/rute.svg'

export default function SwipeableTemporaryDrawer() {
	const [drawer, setDrawer] = useState(true);

	document.addEventListener('click', (event) => {

		const str = event.target.innerHTML 

		if (!str || str.length === 0 || str.length > 30 || str === 'x') {
			console.log("nothing")
		} else {
			console.log(event.target.innerHTML)
			setDrawer(false)
		}
	})

	return (
		<div id="drawer">
			<Global
				styles={{
					'.MuiDrawer-root > .MuiPaper-root': {
						height: '90%',
						overflow: 'visible',
					},
				}}
			/>
			<div class="drawer-button" onClick={() => {setDrawer(true); }}>
				<div class="logo-container" >
					<i class="fas fa-bars fa-lg"></i>
					<img alt='logo' src={rute} className='logo' />
				</div>
			</div>
			<Drawer
				anchor={'bottom'}
				open={drawer}
				onClose={() => setDrawer(false)}
				onOpen={() => setDrawer(true)}
				sx={{ height: 1/2 }}
				swipeAreaWidth={54}
				ModalProps={{
				keepMounted: true,
				}}
			>
				<Content />
				<button id="drawer-close" onClick={() => setDrawer(false)}>
					<span style="color: white;">
						<i class="fas fa-angle-down fa-2x"></i>
					</span>
				</button>
			</Drawer>
		</div>
	);
}
