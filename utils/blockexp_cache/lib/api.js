// API
const log = require('./logger');

module.exports = (app, api, axios, JSONbig) => {

  app.get('/api/get_info/:flags', (req, res) => {
    let flags = req.params.flags;
    axios({
      method: 'get',
      url: api,
      data: {
        method: 'getinfo',
        params: {'flags': parseInt(flags)},
      },
      transformResponse: [data => JSONbig.parse(data)]
    })
      .then((response) => {
        res.send(JSON.stringify(response.data));
      })
      .catch(function (error) {
        log.error('get_info failed (API)', error);
      });
  });

  app.get('/api/get_blocks_details/:start/:count', (req, res) => {
    let start = req.params.start;
    let count = req.params.count;
    axios({
      method: 'get',
      url: api,
      data: {
        method: 'get_blocks_details',
        params: {
          "height_start": parseInt(start ? start : 0),
          "count": parseInt(count ? count : 10),
          "ignore_transactions": false
        },
      },
      transformResponse: [data => JSONbig.parse(data)]
    })
      .then(function (response) {
        res.send(JSON.stringify(response.data));
      })
      .catch(function (error) {
        log.error('get_blocks_details failed (API)', error);
      });
  });

  app.get('/api/get_main_block_details/:id', (req, res) => {
    let id = req.params.id;
    axios({
      method: 'get',
      url: api,
      data: {
        method: 'get_main_block_details',
        params: {
          'id': id
        },
      },
      transformResponse: [data => JSONbig.parse(data)]
    })
      .then(function (response) {
        res.send(JSON.stringify(response.data));
      })
      .catch(function (error) {
        log.error('get_main_block_details failed (API)', error);
      });
  });

  app.get('/api/get_alt_blocks_details/:offset/:count', (req, res) => {
    let offset = req.params.offset;
    let count = req.params.count;
    axios({
      method: 'get',
      url: api,
      data: {
        method: 'get_alt_blocks_details',
        params: {
          "offset": parseInt(offset),
          "count": parseInt(count)
        },
      },
      transformResponse: [data => JSONbig.parse(data)]
    })
      .then(function (response) {
        res.send(JSON.stringify(response.data));
      })
      .catch(function (error) {
        log.error('get_alt_blocks_details failed (API)', error);
      });
  });

  app.get('/api/get_alt_block_details/:id', (req, res) => {
    let id = req.params.id;
    axios({
      method: 'get',
      url: api,
      data: {
        method: 'get_alt_block_details',
        params: {
          'id': id
        },
      },
      transformResponse: [data => JSONbig.parse(data)]
    })
      .then(function (response) {
        res.send(JSON.stringify(response.data));
      })
      .catch(function (error) {
        log.error('get_alt_block_details failed (API)', error);
      });
  });

  app.get('/api/get_pool_txs_details', (req, res) => {
    axios({
      method: 'get',
      url: api,
      data: {
        method: 'get_pool_txs_details',
      },
      transformResponse: [data => JSONbig.parse(data)]
    })
      .then((response) => {
        res.send(JSON.stringify(response.data));
      })
      .catch(function (error) {
        log.error('get_pool_txs_details failed (API)', error);
      });
  });

  app.get('/api/get_pool_txs_brief_details', (req, res) => {
    axios({
      method: 'get',
      url: api,
      data: {
        method: 'get_pool_txs_brief_details',
      },
      transformResponse: [data => JSONbig.parse(data)]
    })
      .then((response) => {
        res.send(JSON.stringify(response.data));
      })
      .catch(function (error) {
        log.error('get_pool_txs_brief_details failed (API)', error);
      });
  });

  app.get('/api/get_all_pool_tx_list', (req, res) => {
    axios({
      method: 'get',
      url: api,
      data: {
        method: 'get_all_pool_tx_list',
      },
      transformResponse: [data => JSONbig.parse(data)]
    })
      .then((response) => {
        res.send(JSON.stringify(response.data));
      })
      .catch(function (error) {
        log.error('get_all_pool_tx_list failed (API)', error);
      });
  });

  app.get('/api/get_tx_details/:tx_hash', (req, res) => {
    let tx_hash = req.params.tx_hash;
    axios({
      method: 'get',
      url: api,
      data: {
        method: 'get_tx_details',
        params: {'tx_hash': tx_hash},
      },
      transformResponse: [data => JSONbig.parse(data)]
    })
      .then((response) => {
        res.send(JSON.stringify(response.data));
      })
      .catch(function (error) {
        log.error('get_tx_details failed (API)', error);
      });
  });

  let get_info = () => {
   return axios({
      method: 'get',
      url: api,
      data: {
        method: 'getinfo',
        params: {'flags': 0x410},
      },
      transformResponse: [data => JSONbig.parse(data)]
    })
    .then(response => {
      return response.data;
    })
    .catch(err => {
      log.error('request get_info failed ', err)
    })
  };


  let get_blocks_details = (start, count) => {
    return axios({
      method: 'get',
      url: api,
      data: {
        method: 'get_blocks_details',
        params: {
          "height_start": parseInt(start ? start : 0),
          "count": parseInt(count ? count : 10),
          "ignore_transactions": false
        },
      },
      transformResponse: [data => JSONbig.parse(data)]
    })
    .then(response => {
      return response.data;
    })
    .catch(err => {
      log.error('request get_blocks_details failed', err);
    });
  };

  let get_alt_blocks_details = (offset, count) => {
    return axios({
      method: 'get',
      url: api,
      data: {
        method: 'get_alt_blocks_details',
        params: {
          "offset": parseInt(offset),
          "count": parseInt(count)
        },
      },
      transformResponse: [data => JSONbig.parse(data)]
    })
    .then(response => {
      return Promise.resolve(response.data);
    })
    .catch(err => {
      log.error('request get_alt_blocks_details failed', err);
    });
  };

  let get_all_pool_tx_list = () => {
    return axios({
      method: 'get',
      url: api,
      data: {
        method: 'get_all_pool_tx_list',
      },
      transformResponse: [data => JSONbig.parse(data)]
    })
    .then(response => {
      return Promise.resolve(response.data);
    })
    .catch(err => {
      log.error('request get_all_pool_tx_list failed', err);
    });
  };

  let get_pool_txs_details = (ids) => {
    return axios({
      method: 'get',
      url: api,
      data: {
        method: 'get_pool_txs_details',
        params: {'ids': ids},
      },
      transformResponse: [data => JSONbig.parse(data)]
    })
    .then(response => {
      return Promise.resolve(response.data);
    })
    .catch(err => {
      log.error('request get_pool_txs_details failed', err);
    });
  };

  let get_tx_details = (tx_hash) => {
    return axios({
      method: 'get',
      url: api,
      data: {
        method: 'get_tx_details',
        params: {'tx_hash': tx_hash},
      },
      transformResponse: [data => JSONbig.parse(data)]
    })
    .then(response => {
      return response.data;
    })
    .catch(err => {
      log.error('request get_tx_details failed', err);
    });
  };

  let get_out_info = (amount, i) => {
    return axios({
      method: 'get',
      url: api,
      data: {
        method: 'get_out_info',
        params: {'amount': parseInt(amount), 'i': parseInt(i)},
      },
      transformResponse: [data => JSONbig.parse(data)]
    })
    .then(response => {
      return Promise.resolve(response.data);
    })
    .catch(err => {
      log.error('request get_out_info failed', err);
    });
  };

  return {
    get_info,
    get_blocks_details,
    get_alt_blocks_details,
    get_all_pool_tx_list,
    get_pool_txs_details,
    get_tx_details,
    get_out_info
  }

};

