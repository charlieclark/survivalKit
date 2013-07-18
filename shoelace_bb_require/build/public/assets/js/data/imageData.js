var imageGroups = {

    "plinko": {
        type: "list",
        data: [
            { name: "bg", url: "views/plinko/bg.jpg" },
            { name: "disk", url: "views/plinko/disk.png" },
            { name: "board", url: "views/plinko/board.png" },
            { name: "nail", url: "views/plinko/nail.png" },
            { name: "bucket-front", url: "views/plinko/bucket-front.png" },
            { name: "bucket-back", url: "views/plinko/bucket-back.png" },
            { name: "title", url: "views/plinko/title.png" },

            { name: "social-facebook", url: "views/plinko/social-icon-facebook.png" },
            { name: "social-twitter", url: "views/plinko/social-icon-twitter.png" },
            { name: "social-mail", url: "views/plinko/social-icon-mail.png" }


        ]
    },
    "mrPeanut": {
        type: "sequence",
        data: {
            url: "views/plinko/mrPeanut_sequence/plinko_",
            padding: 3,
            numImages: 38,
            extension: "png",
            skipFrames: 0
        }
    }
}

