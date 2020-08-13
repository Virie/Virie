module.exports = (db) => {
  db.serialize(() => {
    db.run("create table if not exists blocks (height INTEGER UNIQUE" +
      ", actual_timestamp INTEGER" +
      ", base_reward INTEGER" +
      ", block_cumulative_size INTEGER" +
      ", cumulative_diff_adjusted INTEGER" +
      ", cumulative_diff_precise INTEGER" +
      ", difficulty INTEGER" +
      ", effective_fee_median INTEGER" +
      ", id TEXT" +
      ", is_orphan INTEGER" +
      ", penalty INTEGER" +
      ", prev_id TEXT" +
      ", summary_reward INTEGER" +
      ", this_block_fee_median INTEGER" +
      ", timestamp INTEGER" +
      ", total_fee INTEGER" +
      ", total_txs_size INTEGER" +
      ", tr_count INTEGER" +
      ", type INTEGER" +
      ", miner_text_info TEXT" +
      ");");

    db.run("CREATE INDEX if not exists index_bl_height ON blocks(height);");
    db.run("CREATE INDEX if not exists index_bl_id ON blocks(id);");

    db.run("create table if not exists transactions (keeper_block INTEGER, " +
      "id TEXT, " +
      "amount INTEGER," +
      "blob_size INTEGER," +
      "extra TEXT," +
      "fee INTEGER," +
      "ins TEXT," +
      "outs TEXT," +
      "pub_key TEXT," +
      "timestamp INTEGER," +
      "attachments TEXT" +
      ");");

    db.run("CREATE INDEX if not exists index_tr_keeper_block ON transactions(keeper_block);");
    db.run("CREATE INDEX if not exists index_tr_id ON transactions(id);");

    db.run('create table if not exists aliases (' +
      'alias TEXT,' +
      'address TEXT,' +
      'comment TEXT,' +
      'tracking_key TEXT,' +
      'block INTEGER,' +
      'transact TEXT,' +
      'enabled INTEGER' +
      ');');

    db.run("CREATE INDEX if not exists index_al_block ON aliases(block);");

    db.run('create table if not exists alt_blocks (' +
      'height INTEGER,' +
      'timestamp INTEGER,' +
      'actual_timestamp INTEGER,' +
      'size INTEGER,' +
      'hash TEXT,' +
      'type INTEGER,' +
      'difficulty INTEGER,' +
      'cumulative_diff_adjusted INTEGER,' +
      'cumulative_diff_precise INTEGER,' +
      'is_orphan INTEGER,' +
      'base_reward INTEGER,' +
      'total_fee INTEGER,' +
      'penalty TEXT,' +
      'summary_reward INTEGER,' +
      'block_cumulative_size INTEGER,' +
      'this_block_fee_median INTEGER,' +
      'effective_fee_median INTEGER,' +
      'total_txs_size INTEGER,' +
      'transactions_details TEXT,' +
      'miner_txt_info TEXT' +
      ');');

    db.run("CREATE INDEX if not exists index_ab_hash ON alt_blocks(hash);");

    db.run('create table if not exists pool (' +
      'blob_size TEXT,' +
      'fee TEXT,' +
      'id TEXT,' +
      'timestamp TEXT' +
      ');');

    db.run("CREATE INDEX if not exists index_pool_id ON pool(id);");

    db.run('create table if not exists charts (' +
      "height INTEGER" +
      ", actual_timestamp INTEGER" +
      ", block_cumulative_size INTEGER" +
      ", cumulative_diff_precise TEXT" +
      ", difficulty TEXT" +
      ", tr_count INTEGER" +
      ", type INTEGER" +
      ", difficulty120 TEXT" +
      ", hashrate100 TEXT" +
      ", hashrate400 TEXT" +
      ');');

    db.run("CREATE INDEX if not exists index_bl_height ON charts(height);");

    db.run('create table if not exists market (' +
      'offers_id TEXT,' +
      'offer_id_current TEXT,' +
      'action TEXT,' +
      'block INTEGER,' +
      'tx TEXT,' +
      'timestamp INTEGER,' +
      'ap INTEGER,' +
      'at INTEGER,' +
      'b TEXT,' +
      'cat TEXT,' +
      'cnt TEXT,' +
      'com TEXT,' +
      'do TEXT,' +
      'et INTEGER,' +
      'lci TEXT,' +
      'lco TEXT,' +
      'ot INTEGER,' +
      'p TEXT,' +
      'pt TEXT,' +
      't TEXT' +
      ');');

    db.run("CREATE INDEX if not exists index_market_offer_id_current ON market(offer_id_current);");

    db.run('create table if not exists out_info (' +
      'amount INTEGER,' +
      'i INTEGER,' +
      'tx_id TEXT,' +
      'block INTEGER' +
      ');');

    db.run("CREATE UNIQUE INDEX if not exists index_out_info ON out_info(amount, i, tx_id);");

  });
};


