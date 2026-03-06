/**
 * Program IDL in camelCase format in order to be used in JS/TS.
 *
 * Note that this is only a type helper and is not the actual IDL. The original
 * IDL can be found at `target/idl/organ_donation_system.json`.
 */
export type OrganDonationSystem = {
  "address": "7DtCGYSvSrpDJDEegvzjZKWibD6zi2rvzxPdYZiAVuvN",
  "metadata": {
    "name": "organDonationSystem",
    "version": "0.1.0",
    "spec": "0.1.0",
    "description": "Created with Anchor"
  },
  "instructions": [
    {
      "name": "addDoctor",
      "discriminator": [
        79,
        195,
        205,
        116,
        208,
        136,
        89,
        161
      ],
      "accounts": [
        {
          "name": "doctorAccount",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  100,
                  111,
                  99,
                  116,
                  111,
                  114
                ]
              },
              {
                "kind": "account",
                "path": "doctorWallet"
              }
            ]
          }
        },
        {
          "name": "hospitalAccount",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  104,
                  111,
                  115,
                  112,
                  105,
                  116,
                  97,
                  108
                ]
              },
              {
                "kind": "account",
                "path": "hospitalWallet"
              }
            ]
          }
        },
        {
          "name": "hospitalWallet",
          "writable": true,
          "signer": true
        },
        {
          "name": "doctorWallet"
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "specialization",
          "type": {
            "defined": {
              "name": "doctorSpec"
            }
          }
        }
      ]
    },
    {
      "name": "addValidator",
      "discriminator": [
        250,
        113,
        53,
        54,
        141,
        117,
        215,
        185
      ],
      "accounts": [
        {
          "name": "validatorAccount",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  118,
                  97,
                  108,
                  105,
                  100,
                  97,
                  116,
                  111,
                  114
                ]
              },
              {
                "kind": "account",
                "path": "validatorWallet"
              }
            ]
          }
        },
        {
          "name": "registry",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  114,
                  101,
                  103,
                  105,
                  115,
                  116,
                  114,
                  121
                ]
              }
            ]
          }
        },
        {
          "name": "authority",
          "writable": true,
          "signer": true,
          "relations": [
            "registry"
          ]
        },
        {
          "name": "validatorWallet"
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": []
    },
    {
      "name": "authorizeHospital",
      "discriminator": [
        83,
        41,
        135,
        109,
        156,
        27,
        174,
        58
      ],
      "accounts": [
        {
          "name": "hospitalAccount",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  104,
                  111,
                  115,
                  112,
                  105,
                  116,
                  97,
                  108
                ]
              },
              {
                "kind": "account",
                "path": "hospitalWallet"
              }
            ]
          }
        },
        {
          "name": "registry",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  114,
                  101,
                  103,
                  105,
                  115,
                  116,
                  114,
                  121
                ]
              }
            ]
          }
        },
        {
          "name": "authority",
          "writable": true,
          "signer": true,
          "relations": [
            "registry"
          ]
        },
        {
          "name": "hospitalWallet"
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "name",
          "type": "string"
        },
        {
          "name": "role",
          "type": {
            "defined": {
              "name": "hospitalRole"
            }
          }
        }
      ]
    },
    {
      "name": "doctorSign",
      "discriminator": [
        82,
        55,
        158,
        247,
        161,
        183,
        154,
        217
      ],
      "accounts": [
        {
          "name": "certification",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  99,
                  101,
                  114,
                  116,
                  105,
                  102,
                  105,
                  99,
                  97,
                  116,
                  105,
                  111,
                  110
                ]
              },
              {
                "kind": "account",
                "path": "certification.donor",
                "account": "brainDeathCertification"
              }
            ]
          }
        },
        {
          "name": "doctorAccount",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  100,
                  111,
                  99,
                  116,
                  111,
                  114
                ]
              },
              {
                "kind": "account",
                "path": "doctorWallet"
              }
            ]
          }
        },
        {
          "name": "doctorWallet",
          "signer": true
        }
      ],
      "args": []
    },
    {
      "name": "finalizeAllocation",
      "discriminator": [
        56,
        163,
        79,
        248,
        42,
        105,
        247,
        122
      ],
      "accounts": [
        {
          "name": "proposal",
          "writable": true
        },
        {
          "name": "registry",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  114,
                  101,
                  103,
                  105,
                  115,
                  116,
                  114,
                  121
                ]
              }
            ]
          }
        },
        {
          "name": "authority",
          "signer": true,
          "relations": [
            "registry"
          ]
        }
      ],
      "args": []
    },
    {
      "name": "finalizeCertification",
      "discriminator": [
        122,
        20,
        234,
        189,
        95,
        88,
        199,
        198
      ],
      "accounts": [
        {
          "name": "certification",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  99,
                  101,
                  114,
                  116,
                  105,
                  102,
                  105,
                  99,
                  97,
                  116,
                  105,
                  111,
                  110
                ]
              },
              {
                "kind": "account",
                "path": "certification.donor",
                "account": "brainDeathCertification"
              }
            ]
          }
        },
        {
          "name": "hospitalAccount",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  104,
                  111,
                  115,
                  112,
                  105,
                  116,
                  97,
                  108
                ]
              },
              {
                "kind": "account",
                "path": "hospitalWallet"
              }
            ]
          }
        },
        {
          "name": "hospitalWallet",
          "signer": true
        }
      ],
      "args": []
    },
    {
      "name": "initializeRegistry",
      "discriminator": [
        189,
        181,
        20,
        17,
        174,
        57,
        249,
        59
      ],
      "accounts": [
        {
          "name": "registry",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  114,
                  101,
                  103,
                  105,
                  115,
                  116,
                  114,
                  121
                ]
              }
            ]
          }
        },
        {
          "name": "authority",
          "writable": true,
          "signer": true
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": []
    },
    {
      "name": "markDeceased",
      "discriminator": [
        151,
        122,
        115,
        89,
        202,
        179,
        214,
        203
      ],
      "accounts": [
        {
          "name": "donorAccount",
          "writable": true
        },
        {
          "name": "registry",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  114,
                  101,
                  103,
                  105,
                  115,
                  116,
                  114,
                  121
                ]
              }
            ]
          }
        },
        {
          "name": "authority",
          "signer": true,
          "relations": [
            "registry"
          ]
        }
      ],
      "args": []
    },
    {
      "name": "proposeAllocation",
      "discriminator": [
        111,
        172,
        228,
        160,
        69,
        200,
        245,
        202
      ],
      "accounts": [
        {
          "name": "proposal",
          "writable": true
        },
        {
          "name": "registry",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  114,
                  101,
                  103,
                  105,
                  115,
                  116,
                  114,
                  121
                ]
              }
            ]
          }
        },
        {
          "name": "certification",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  99,
                  101,
                  114,
                  116,
                  105,
                  102,
                  105,
                  99,
                  97,
                  116,
                  105,
                  111,
                  110
                ]
              },
              {
                "kind": "account",
                "path": "donorAccount"
              }
            ]
          }
        },
        {
          "name": "donorAccount"
        },
        {
          "name": "recipientHospital"
        },
        {
          "name": "authority",
          "writable": true,
          "signer": true,
          "relations": [
            "registry"
          ]
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "organBit",
          "type": "u8"
        }
      ]
    },
    {
      "name": "registerDonor",
      "discriminator": [
        170,
        42,
        14,
        170,
        45,
        210,
        127,
        107
      ],
      "accounts": [
        {
          "name": "donorAccount",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  100,
                  111,
                  110,
                  111,
                  114
                ]
              },
              {
                "kind": "account",
                "path": "wallet"
              }
            ]
          }
        },
        {
          "name": "registry",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  114,
                  101,
                  103,
                  105,
                  115,
                  116,
                  114,
                  121
                ]
              }
            ]
          }
        },
        {
          "name": "wallet",
          "writable": true,
          "signer": true
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "organsBitmask",
          "type": "u8"
        },
        {
          "name": "nomineeWallet",
          "type": {
            "option": "pubkey"
          }
        },
        {
          "name": "ipfsCid",
          "type": "string"
        }
      ]
    },
    {
      "name": "revokeConsent",
      "discriminator": [
        36,
        0,
        100,
        148,
        132,
        131,
        112,
        76
      ],
      "accounts": [
        {
          "name": "donorAccount",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  100,
                  111,
                  110,
                  111,
                  114
                ]
              },
              {
                "kind": "account",
                "path": "wallet"
              }
            ]
          }
        },
        {
          "name": "wallet",
          "signer": true,
          "relations": [
            "donorAccount"
          ]
        }
      ],
      "args": []
    },
    {
      "name": "revokeDoctor",
      "discriminator": [
        4,
        85,
        201,
        220,
        151,
        175,
        32,
        40
      ],
      "accounts": [
        {
          "name": "doctorAccount",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  100,
                  111,
                  99,
                  116,
                  111,
                  114
                ]
              },
              {
                "kind": "account",
                "path": "doctor_account.wallet",
                "account": "doctorAccount"
              }
            ]
          }
        },
        {
          "name": "hospitalAccount",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  104,
                  111,
                  115,
                  112,
                  105,
                  116,
                  97,
                  108
                ]
              },
              {
                "kind": "account",
                "path": "hospitalWallet"
              }
            ]
          }
        },
        {
          "name": "hospitalWallet",
          "signer": true
        }
      ],
      "args": []
    },
    {
      "name": "revokeHospital",
      "discriminator": [
        248,
        20,
        60,
        244,
        209,
        242,
        55,
        60
      ],
      "accounts": [
        {
          "name": "hospitalAccount",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  104,
                  111,
                  115,
                  112,
                  105,
                  116,
                  97,
                  108
                ]
              },
              {
                "kind": "account",
                "path": "hospital_account.wallet",
                "account": "hospitalAccount"
              }
            ]
          }
        },
        {
          "name": "registry",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  114,
                  101,
                  103,
                  105,
                  115,
                  116,
                  114,
                  121
                ]
              }
            ]
          }
        },
        {
          "name": "authority",
          "signer": true,
          "relations": [
            "registry"
          ]
        }
      ],
      "args": []
    },
    {
      "name": "revokeValidator",
      "discriminator": [
        240,
        45,
        235,
        3,
        39,
        165,
        40,
        101
      ],
      "accounts": [
        {
          "name": "validatorAccount",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  118,
                  97,
                  108,
                  105,
                  100,
                  97,
                  116,
                  111,
                  114
                ]
              },
              {
                "kind": "account",
                "path": "validator_account.wallet",
                "account": "validatorAccount"
              }
            ]
          }
        },
        {
          "name": "registry",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  114,
                  101,
                  103,
                  105,
                  115,
                  116,
                  114,
                  121
                ]
              }
            ]
          }
        },
        {
          "name": "authority",
          "signer": true,
          "relations": [
            "registry"
          ]
        }
      ],
      "args": []
    },
    {
      "name": "submitCertification",
      "discriminator": [
        15,
        233,
        175,
        70,
        117,
        114,
        224,
        163
      ],
      "accounts": [
        {
          "name": "certification",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  99,
                  101,
                  114,
                  116,
                  105,
                  102,
                  105,
                  99,
                  97,
                  116,
                  105,
                  111,
                  110
                ]
              },
              {
                "kind": "account",
                "path": "donorAccount"
              }
            ]
          }
        },
        {
          "name": "hospitalAccount",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  104,
                  111,
                  115,
                  112,
                  105,
                  116,
                  97,
                  108
                ]
              },
              {
                "kind": "account",
                "path": "hospitalWallet"
              }
            ]
          }
        },
        {
          "name": "donorAccount"
        },
        {
          "name": "hospitalWallet",
          "writable": true,
          "signer": true
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "ipfsCid",
          "type": "string"
        }
      ]
    },
    {
      "name": "validatorApprove",
      "discriminator": [
        16,
        76,
        254,
        208,
        136,
        253,
        241,
        217
      ],
      "accounts": [
        {
          "name": "proposal",
          "writable": true
        },
        {
          "name": "validatorAccount",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  118,
                  97,
                  108,
                  105,
                  100,
                  97,
                  116,
                  111,
                  114
                ]
              },
              {
                "kind": "account",
                "path": "validatorWallet"
              }
            ]
          }
        },
        {
          "name": "validatorWallet",
          "signer": true
        }
      ],
      "args": []
    }
  ],
  "accounts": [
    {
      "name": "allocationProposal",
      "discriminator": [
        121,
        19,
        15,
        83,
        91,
        230,
        136,
        123
      ]
    },
    {
      "name": "brainDeathCertification",
      "discriminator": [
        209,
        241,
        168,
        184,
        134,
        68,
        29,
        99
      ]
    },
    {
      "name": "doctorAccount",
      "discriminator": [
        253,
        1,
        68,
        157,
        144,
        253,
        166,
        195
      ]
    },
    {
      "name": "donorAccount",
      "discriminator": [
        117,
        7,
        167,
        205,
        254,
        21,
        69,
        6
      ]
    },
    {
      "name": "donorRegistry",
      "discriminator": [
        57,
        176,
        49,
        211,
        249,
        154,
        34,
        7
      ]
    },
    {
      "name": "hospitalAccount",
      "discriminator": [
        14,
        198,
        35,
        4,
        188,
        132,
        255,
        203
      ]
    },
    {
      "name": "validatorAccount",
      "discriminator": [
        32,
        144,
        229,
        203,
        9,
        154,
        158,
        255
      ]
    }
  ],
  "errors": [
    {
      "code": 6000,
      "name": "invalidOrganBit",
      "msg": "organ_bit must have exactly 1 bit set"
    },
    {
      "code": 6001,
      "name": "certNotCertified",
      "msg": "Brain death certification is not Certified yet"
    },
    {
      "code": 6002,
      "name": "recipientNotActive",
      "msg": "Recipient hospital is not active"
    },
    {
      "code": 6003,
      "name": "recipientNotTransplant",
      "msg": "Recipient hospital does not have TransplantCenter or Both role"
    },
    {
      "code": 6004,
      "name": "organNotDonated",
      "msg": "This organ was not listed in the donor's consent"
    },
    {
      "code": 6005,
      "name": "validatorNotActive",
      "msg": "Validator is not active"
    },
    {
      "code": 6006,
      "name": "validatorAlreadyInactive",
      "msg": "Validator is already inactive"
    },
    {
      "code": 6007,
      "name": "proposalNotOpen",
      "msg": "Proposal is not in Proposed status"
    },
    {
      "code": 6008,
      "name": "alreadyFullySigned",
      "msg": "Proposal already has 5 validator signatures"
    },
    {
      "code": 6009,
      "name": "alreadyVoted",
      "msg": "Validator has already voted on this proposal"
    },
    {
      "code": 6010,
      "name": "quorumNotReached",
      "msg": "Quorum not reached — need at least 3 validator approvals"
    },
    {
      "code": 6011,
      "name": "unauthorized",
      "msg": "Unauthorized — signer does not own this account"
    }
  ],
  "types": [
    {
      "name": "allocStatus",
      "type": {
        "kind": "enum",
        "variants": [
          {
            "name": "proposed"
          },
          {
            "name": "approved"
          }
        ]
      }
    },
    {
      "name": "allocationProposal",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "donor",
            "type": "pubkey"
          },
          {
            "name": "certification",
            "type": "pubkey"
          },
          {
            "name": "recipientHospital",
            "type": "pubkey"
          },
          {
            "name": "organBit",
            "type": "u8"
          },
          {
            "name": "proposedBy",
            "type": "pubkey"
          },
          {
            "name": "validators",
            "type": {
              "array": [
                "pubkey",
                5
              ]
            }
          },
          {
            "name": "validatorCount",
            "type": "u8"
          },
          {
            "name": "status",
            "type": {
              "defined": {
                "name": "allocStatus"
              }
            }
          },
          {
            "name": "proposedAt",
            "type": "i64"
          },
          {
            "name": "finalizedAt",
            "type": "i64"
          },
          {
            "name": "bump",
            "type": "u8"
          }
        ]
      }
    },
    {
      "name": "brainDeathCertification",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "donor",
            "type": "pubkey"
          },
          {
            "name": "hospital",
            "type": "pubkey"
          },
          {
            "name": "ipfsCid",
            "type": "string"
          },
          {
            "name": "signers",
            "type": {
              "array": [
                "pubkey",
                4
              ]
            }
          },
          {
            "name": "signerCount",
            "type": "u8"
          },
          {
            "name": "hasNeuro",
            "type": "bool"
          },
          {
            "name": "status",
            "type": {
              "defined": {
                "name": "certStatus"
              }
            }
          },
          {
            "name": "submittedAt",
            "type": "i64"
          },
          {
            "name": "certifiedAt",
            "type": "i64"
          },
          {
            "name": "bump",
            "type": "u8"
          }
        ]
      }
    },
    {
      "name": "certStatus",
      "type": {
        "kind": "enum",
        "variants": [
          {
            "name": "pending"
          },
          {
            "name": "certified"
          }
        ]
      }
    },
    {
      "name": "doctorAccount",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "wallet",
            "type": "pubkey"
          },
          {
            "name": "hospital",
            "type": "pubkey"
          },
          {
            "name": "specialization",
            "type": {
              "defined": {
                "name": "doctorSpec"
              }
            }
          },
          {
            "name": "isActive",
            "type": "bool"
          },
          {
            "name": "addedAt",
            "type": "i64"
          },
          {
            "name": "bump",
            "type": "u8"
          }
        ]
      }
    },
    {
      "name": "doctorSpec",
      "type": {
        "kind": "enum",
        "variants": [
          {
            "name": "neurologist"
          },
          {
            "name": "neurosurgeon"
          },
          {
            "name": "icuSpecialist"
          },
          {
            "name": "transplant"
          }
        ]
      }
    },
    {
      "name": "donorAccount",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "wallet",
            "type": "pubkey"
          },
          {
            "name": "organsBitmask",
            "type": "u8"
          },
          {
            "name": "nomineeWallet",
            "type": {
              "option": "pubkey"
            }
          },
          {
            "name": "ipfsCid",
            "type": "string"
          },
          {
            "name": "status",
            "type": {
              "defined": {
                "name": "donorStatus"
              }
            }
          },
          {
            "name": "registeredAt",
            "type": "i64"
          },
          {
            "name": "updatedAt",
            "type": "i64"
          },
          {
            "name": "bump",
            "type": "u8"
          }
        ]
      }
    },
    {
      "name": "donorRegistry",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "authority",
            "type": "pubkey"
          },
          {
            "name": "donorCount",
            "type": "u64"
          },
          {
            "name": "bump",
            "type": "u8"
          }
        ]
      }
    },
    {
      "name": "donorStatus",
      "type": {
        "kind": "enum",
        "variants": [
          {
            "name": "active"
          },
          {
            "name": "revoked"
          },
          {
            "name": "deceased"
          }
        ]
      }
    },
    {
      "name": "hospitalAccount",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "wallet",
            "type": "pubkey"
          },
          {
            "name": "name",
            "type": "string"
          },
          {
            "name": "role",
            "type": {
              "defined": {
                "name": "hospitalRole"
              }
            }
          },
          {
            "name": "isActive",
            "type": "bool"
          },
          {
            "name": "authorizedAt",
            "type": "i64"
          },
          {
            "name": "bump",
            "type": "u8"
          }
        ]
      }
    },
    {
      "name": "hospitalRole",
      "type": {
        "kind": "enum",
        "variants": [
          {
            "name": "icu"
          },
          {
            "name": "transplantCenter"
          },
          {
            "name": "both"
          }
        ]
      }
    },
    {
      "name": "validatorAccount",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "wallet",
            "type": "pubkey"
          },
          {
            "name": "isActive",
            "type": "bool"
          },
          {
            "name": "addedAt",
            "type": "i64"
          },
          {
            "name": "bump",
            "type": "u8"
          }
        ]
      }
    }
  ]
};
