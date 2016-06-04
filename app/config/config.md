### **Introduction**
This is the documentation for the settings in the Appliance **config.json** file. There are several conventions in use herein:
* (**default** = `value`)    
  Indicates the default value for a setting.
* (**varies**)    
  Indicates that the value of a setting will vary per installation.
* **DEPRECATED**    
  Indicates that a setting is deprecated and will be removed in the future. For settings marked as deprecated, an entry in the **Deprecation Schedule**
  will be present to indicate in what version those settings will be removed.
* (**moved** from|to `dotted.path`)
  * **to** - For deprecated settings, indicates that a new setting has taken this setting's place at `dotted.path`.
  * **from** - Indicates that this setting has taken the place of a deprecated setting at `dotted.path`.
* When a specific set of values are valid, a nested list of valid values will be provided below the setting. `true` and `false` are not explicitly listed for Boolean values.
* When a numerical value is in specific units, the units will be listed at the end of the sentence as, "...in units."

### **Deprecation Schedule**
This table indicates in what version each of these deprecated settings will be removed.

| Path | Version |
| -------- | -------- |

------

The remainder of this document contains each configuration setting, grouped into sections the nodes in its full dotted path. 

* `title` -
* `hostname` - The hostname to listen on. (**default** = `"127.0.0.1"`)
* `port` - The port to listen on. (**default** = `7777`)
* `environment` - The environment. (**default** = ``"production"``)
   * `"production"` - When set to `"production"`, services will not run in debug mode and stacktraces on 500 errors will not show up.
   * `"development"` - When set to `"development"`, services will run in debug mode and stacktraces on 500 errors will show up.
* `logLevel` - The log level. (**default** = `"info"`)
   * `"alert"`
   * `"critical"`
   * `"error"`
   * `"warning"`
   * `"notice"`
   * `"info"`
   * `"debug"`
* `tempFilePath` - The directory path where to store temporary files. (**default** = `"/tmp"`)