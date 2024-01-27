import express from 'express';
import { checkAuth, checkPrinciple } from '../../utils/middleware.js';
const app = express();
app.get('/', checkAuth, checkPrinciple, async (req, res) => {
    try {
        
    } catch (err) {

    }
})

export default app;