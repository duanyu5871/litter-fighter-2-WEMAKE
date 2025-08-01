const { execSync: execSync_ } = require('child_process')
const build_date_time = new Date().toLocaleString()

const execSync = (...args) => {
  try {
    return execSync_(...args).toString().trim()
  } catch (e) {
    return ''
  }
}
const build_user_name = execSync('git config user.name') || 'user_not_login'
const build_user_mail = execSync('git config user.email') || 'user_not_login'
const git_commid_id = execSync("git rev-parse head") || 'unknown'
const git_branch = execSync('git symbolic-ref --short -q HEAD') || 'unknown'
module.exports = {
  git_commid_id,
  git_branch,
  build_user_name,
  build_user_mail,
  build_date_time,
}