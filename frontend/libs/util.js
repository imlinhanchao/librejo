import axios from 'axios';
import env from '../config/env';
import config from '../../config.json'

let util = {

};
util.title = function(title) {
    title = title ? title + ' - ' + config.web.name: config.web.name;
    window.document.title = title;
};

const ajaxUrl = env === 'development' ?
    `http://localhost:${config.base.port}/api/` :
    env === 'production' ?
    'api/' :
    'api/';

util.ajaxUrl = ajaxUrl;

export default util;