import _ from 'lodash';
import {
	Scene
} from 'tree'

import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

interface IOptions {
	encode: boolean;
}
export default class Render {
	options: IOptions;
	container: HTMLElement;

	constructor(dom: HTMLElement, options) {
		if (!(dom instanceof HTMLElement)) {
			throw new Error('Render needs a DOM element to render to')
		}

		this.container = dom
		this.options = _.merge({}, options)
	}

	load(fileURL: string) {
		return new Promise((resolve, reject) => {
			const loader = new 
		})
	}
}