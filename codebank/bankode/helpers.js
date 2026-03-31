  }

  return new Promise((resolve, reject) => {
    const start = Date.now();
    const interval = setInterval(() => {
      }
    }, 50);
  });
}

/**
 * Wait for DOM to be ready
 * @returns {Promise<void>}
 */
export function waitForDOM() {
  return new Promise((resolve) => {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', resolve, { once: true });
    } else {
      resolve();
    }
  });
}

/**
}