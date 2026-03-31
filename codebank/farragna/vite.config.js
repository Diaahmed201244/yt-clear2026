            ]
            : []),
    ],
    resolve: {
        alias: {
        emptyOutDir: true,
    },
    server: {
        fs: {
            strict: true,
            deny: ["**/.*"],
        },
    },
});
