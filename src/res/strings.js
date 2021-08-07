const strings = {
  app_name: 'Stock Engine',
  maintainer_email: 'xyz@gmail.com'
}

strings.registration = {
  no_credentials: '',
  description: `Application works currently in demo mode.
    If you want to test it, please send email to ${strings.maintainer_email}`,
  about: `${strings.app_name} will keep you up to date with Warsaw Stock Exchange
    via alerts and browser notifications. ` +
    'Its query language with builtin functions support allows you to express any ' +
    'condition in easy way.',
  header: `New to ${strings.app_name}?`
}
strings.notifications = {
  allow_description: `${strings.app_name} will run your alerts on a daily basis. ` +
        'If you want to a receive a notification when the conditions are met, ' +
        'please allow notifications for this site.',
  allow_button: 'Allow notifications'
}
strings.queries = {
  send: 'SEND',
  queries: 'Queries',
  alerts: 'Alerts',
  history: 'History',
  input_placeholder: 'SELECT <fields> FROM <stock regex> ON <condition>',
  example: 'SELECT close FROM <stock> ON close > 50'
}

export default strings
