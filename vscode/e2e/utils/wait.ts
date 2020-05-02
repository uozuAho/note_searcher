export const waitFor = (check: () => boolean, timeoutMs = 1000) => {
  return new Promise((resolve, reject) => {
    let start = Date.now();

    const doCheck = () => {
      if (Date.now() - start > timeoutMs) { 
        reject('timed out');
      }
      if (!check()) {
        setTimeout(() => doCheck(), 100);
      } else {
        resolve(true);
      }
    };

    doCheck();
  });
};

export const waitForAsync = (check: () => Promise<boolean>, timeoutMs = 1000) => {
  return new Promise((resolve, reject) => {
    let start = Date.now();

    const doCheck = () => {
      if (Date.now() - start > timeoutMs) { 
        reject('timed out');
      }
      check().then(result => {
        if (!result) {
          setTimeout(() => doCheck(), 100);
        } else {
          resolve(true);
        }
      });
    };

    doCheck();
  });
};
