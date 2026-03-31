  function getCookie(name){
    try {
      const m = document.cookie.match(new RegExp('(^|; )' + name + '=([^;]+)'));
      return m ? decodeURIComponent(m[2]) : null;
    } catch(_) { return null }
  }

    },

    async _fetchMeAndApply(){
      try {
