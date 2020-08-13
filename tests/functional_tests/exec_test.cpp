#include "exec_test.h"

#include "common/util.h"

using cmd_t = std::string;
using argv_t = std::vector<std::string>;

const std::uint64_t defaut_check_duration = 5000;

class exec_test_context {
public:
  exec_test_context(std::size_t approaches, std::size_t try_count) : try_count(try_count), objects(approaches * try_count) {}

  bool run(const cmd_t &cmd, const argv_t &argv, std::uint64_t ms)
  {
    bool r = true;
    for (std::size_t i = 0; i < try_count; ++i)
      r &= run_impl(cmd, argv, ms);
    return r;
  }

  bool check_zombies()
  {
    for (auto &exec : objects)
      if (exec.running())
        return false;
    return true;
  }

private:
  std::size_t try_count;
  std::vector<tools::exec> objects;
  std::size_t current_index = 0;

  bool run_impl(const cmd_t &cmd, const argv_t &argv, std::uint64_t ms)
  {
    auto &exec = objects[current_index++];
    if (!exec.run(cmd, argv))
      return false;
    if (!exec.running())
      return false;
    std::this_thread::sleep_for(std::chrono::milliseconds(ms));
    return !exec.running();
  }
};

template<typename context_t>
bool exec_test_impl(context_t &ctx, const cmd_t &cmd, const argv_t &argv = argv_t())
{
  if (!ctx.run(cmd, argv, defaut_check_duration))
  {
    LOG_PRINT_RED_L0("fail test");
    return false;
  }
  else
    LOG_PRINT_GREEN("succes test", LOG_LEVEL_0);
  return true;
}

bool exec_test()
{
  const std::size_t approaches = 5;
  const std::size_t try_count = 5;
  auto ctx = exec_test_context(approaches, try_count);
  LOG_PRINT_BLUE("SUCCESS TEST", LOG_LEVEL_0);
  exec_test_impl(ctx, "../../utils/scripts/test/exec.py", { "success" });
  LOG_PRINT_BLUE("LONG TEST", LOG_LEVEL_0);
  exec_test_impl(ctx, "../../utils/scripts/test/exec.py", { "long" });
  LOG_PRINT_BLUE("SUSPEND TEST", LOG_LEVEL_0);
  exec_test_impl(ctx, "../../utils/scripts/test/exec.py", { "suspend" });
  LOG_PRINT_BLUE("X MODE TEST", LOG_LEVEL_0);
  exec_test_impl(ctx, "../../utils/scripts/test/exec_without_x.py");
  LOG_PRINT_BLUE("NON EXISTS TEST", LOG_LEVEL_0);
  exec_test_impl(ctx, "../../utils/scripts/test/exec_non_exists.py");
  bool r = ctx.check_zombies();
  if (!r)
    LOG_ERROR("Incomplete child processes detected. Please check it.");
  return r;
}
