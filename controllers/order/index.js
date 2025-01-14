require('dotenv').config()
const express = require('express')
const router = express.Router()

const type = require('../../libs/type')

router.route('/')
  .get(async (req, res) => {
    const order = require('../../models/order');
    await order.init();

    const orders = await order.read();
    const renderData = {
      ...type.renderData,
      title: 'Orders',
      user: req.session.user || null,
      messages: [],
      isAuthenticated: req.session.token ? true : false,
      currentUrl: req.originalUrl,
      meta: {
        description: 'View all orders',
        keywords: 'orders, view, list'
      },
      error: null,
      success: null,
      data: orders.data
    };

    try {
      res.status(200).render('orders/list', renderData);
    } catch (error) {
      renderData.error = 'Internal Server Error';
      res.status(500).render('orders/list', renderData);
    }
  });

router.route('/create')
  .get(async (req, res) => {
    const renderData = {
      ...type.renderData,
      title: 'Create Order',
      user: req.session.user || null,
      messages: [],
      isAuthenticated: req.session.token ? true : false,
      currentUrl: req.originalUrl,
      meta: {
        description: 'Create a new order',
        keywords: 'create, order, new'
      },
      error: null,
      success: null,
      data: {}
    };

    try {
      res.status(200).render('orders/create', renderData);
    } catch (error) {
      renderData.error = 'Internal Server Error';
      res.status(500).render('orders/create', renderData);
    }
  })
  .post(async (req, res) => {
    const { product_name, price, status } = req.body;

    if (!product_name || !price || !status) {
      return res.status(400).render('orders/create', {
        ...type.renderData,
        error: 'All fields are required'
      });
    }

    const order = require('../../models/order');
    await order.init();

    const newOrder = {
      product_name,
      price,
      status
    };

    await order.create(newOrder);

    res.redirect('/orders');
  });

router.route('/:id')
  .get(async (req, res) => {
    const order = require('../../models/order');
    await order.init();

    const orderId = req.params.id;
    const orderData = await order.read({ id: orderId });

    if (orderData.data.length === 0) {
      return res.status(404).render('error', {
        ...type.renderData,
        error: 'Order not found'
      });
    }

    const renderData = {
      ...type.renderData,
      title: 'Order Details',
      user: req.session.user || null,
      messages: [],
      isAuthenticated: req.session.token ? true : false,
      currentUrl: req.originalUrl,
      meta: {
        description: 'View order details',
        keywords: 'order, details, view'
      },
      error: null,
      success: null,
      data: orderData.data[0]
    };

    try {
      res.status(200).render('orders/detail', renderData);
    } catch (error) {
      renderData.error = 'Internal Server Error';
      res.status(500).render('orders/detail', renderData);
    }
  })
  .post(async (req, res) => {
    const orderId = req.params.id;
    const { product_name, price, status } = req.body;

    if (!product_name || !price || !status) {
      return res.status(400).render('orders/edit', {
        ...type.renderData,
        error: 'All fields are required'
      });
    }

    const order = require('../../models/order');
    await order.init();

    const updatedOrder = {
      product_name,
      price,
      status
    };

    await order.update({ id: orderId }, updatedOrder);

    res.redirect(`/orders/${orderId}`);
  })
  .delete(async (req, res) => {
    const orderId = req.params.id;

    const order = require('../../models/order');
    await order.init();

    await order.delete({ id: orderId });

    res.redirect('/orders');
  });

router.route('/:id/edit')
  .get(async (req, res) => {
    const order = require('../../models/order');
    await order.init();

    const orderId = req.params.id;
    const orderData = await order.read({ id: orderId });

    if (orderData.data.length === 0) {
      return res.status(404).render('error', {
        ...type.renderData,
        error: 'Order not found'
      });
    }

    const renderData = {
      ...type.renderData,
      title: 'Edit Order',
      user: req.session.user || null,
      messages: [],
      isAuthenticated: req.session.token ? true : false,
      currentUrl: req.originalUrl,
      meta: {
        description: 'Edit an existing order',
        keywords: 'edit, order, update'
      },
      error: null,
      success: null,
      data: orderData.data[0]
    };

    try {
      res.status(200).render('orders/edit', renderData);
    } catch (error) {
      renderData.error = 'Internal Server Error';
      res.status(500).render('orders/edit', renderData);
    }
  });

module.exports = router;
