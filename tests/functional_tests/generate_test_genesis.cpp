// Copyright (c) 2014-2020 The Virie Project
// Copyright (c) 2012-2013 The Boolberry developers
// Distributed under the MIT/X11 software license, see the accompanying
// file COPYING or http://www.opensource.org/licenses/mit-license.php.

#include "include_base_utils.h"
#include "storages/portable_storage_template_helper.h"
#include "currency_core/currency_format_utils.h"


void generate_test_genesis(size_t  amount_of_accounts)
{
  // TODO: This test should be reviewed for correctness.
	currency::account_base acc;
	currency::genesis_config_json_struct gcjs = AUTO_VAL_INIT(gcjs);
	for (size_t i = 0; i != amount_of_accounts; i++)
	{		
		acc.generate();
		currency::genesis_payment_entry gpe = AUTO_VAL_INIT(gpe);
		gpe.address_vre = acc.get_public_address_str();
		gpe.amount_vre_int = 10000000000;
		gcjs.payments.push_back(gpe);
	}

	if (!epee::serialization::store_t_to_json_file(gcjs, "genesis_source.json"))
	{
		LOG_ERROR("Failed to store genesis JSON");
	}
}