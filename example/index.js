const syncComplete = (res) => {
  console.log('Sync Complete')
  updateProfileData(window.box)
}
bopen.addEventListener('click', event => {

  window.ethereum.enable().then(addresses => {
    window.Box.openBox(addresses[0],  window.ethereum, {}).then(box => {
      box.onSyncDone(syncComplete)
      window.box = box
      console.log(box)

      controlls.style.display = 'block'
      updateProfileData(box)

      setProfile.addEventListener('click', () => {
        box.public.set(prkey.value, prvalue.value).then(() => {
          prkey.value = null
          prvalue.value = null
          updateProfileData(box)
        })
      })
      verifyGithub.addEventListener('click', () => {
        box.verified.addGithub(gisturl.value).then(() => {
          updateProfileData(box)
        }).catch(error => {
          githubUser.innerHTML = error
        })
      })

      setPrivateStore.addEventListener('click', () => {
        box.private.set(pskey.value, psvalue.value).then(() => {
          pskey.value = null
          psvalue.value = null
        })
      })

      getPrivateStore.addEventListener('click', () => {
        const key = getpskey.value
        box.private.get(key).then(val => {
          getpskey.value = null
          updatePrivateData(key, val)
        })
      })

      openSpace.addEventListener('click', () => {
        const name = spaceName.value
        window.currentSpace = name
        const opts = {
          onSyncDone: () => {
            console.log('sync done in space', name)
            updateSpaceData()
          }
        }
        box.openSpace(name, opts).then(() => {
          spacePub.innerHTML = `Public data in ${name}:`
          spacePriv.innerHTML = `Private data in ${name}:`
          spaceCtrl.style.display = 'block'
          updateSpaceData()
        })
      })

      setSpacePub.addEventListener('click', () => {
        console.log(spkey.value, spvalue.value)
        box.spaces[window.currentSpace].public.set(spkey.value, spvalue.value).then(() => {
          spkey.value = null
          spvalue.value = null
          updateSpaceData()
        })
      })
      setSpacePriv.addEventListener('click', () => {
        console.log(sskey.value, ssvalue.value)
        box.spaces[window.currentSpace].private.set(sskey.value, ssvalue.value).then(() => {
          sskey.value = null
          ssvalue.value = null
          updateSpaceData()
        })
      })
      const updateSpaceData = () => {
        box.spaces[window.currentSpace].public.all().then(entries => {
          spaceDataPub.innerHTML = ''
          Object.keys(entries).map(k => {
            spaceDataPub.innerHTML += k + ': ' + entries[k] + '<br />'
          })
        })
        box.spaces[window.currentSpace].private.all().then(entries => {
          spaceDataPriv.innerHTML = ''
          Object.keys(entries).map(k => {
            spaceDataPriv.innerHTML += k + ': ' + entries[k] + '<br />'
          })
        })
      }

      joinThread.addEventListener('click', () => {
        const name = threadName.value
        const firstModerator = threadfirstModerator.value
        const membersBool = members.checked
        posts.style.display = 'block'
        threadModeration.style.display = 'block'
        if (members.checked) threadMembers.style.display = 'block'
        box.spaces[window.currentSpace].joinThread(name, {firstModerator, members: membersBool}).then(thread => {
          window.currentThread = thread
          thread.onUpdate(() => {
            updateThreadData()
          })
          thread.onNewCapabilities(() => {
            updateThreadCapabilities()
          })
          updateThreadData()
          updateThreadCapabilities()
        }).catch(updateThreadError)
      })

      addThreadMod.addEventListener('click', () => {
        const id = threadMod.value
        window.currentThread.addModerator(id).then(res => {
          updateThreadCapabilities()
        }).catch(updateThreadError)
      })

      addThreadMember.addEventListener('click', () => {
        const id = threadMember.value
        window.currentThread.addMember(id).then(res => {
          updateThreadCapabilities()
        }).catch(updateThreadError)
      })

      window.deletePost = (el) => {
        window.currentThread.deletePost(el.id).then(res => {
          updateThreadData()
        }).catch(updateThreadError)
      }

      const updateThreadError = (e = '') => {
        threadACError.innerHTML = e
      }

      const updateThreadData = () => {
        threadData.innerHTML = ''
        updateThreadError()
        window.currentThread.getPosts().then(posts => {
          posts.map(post => {
            threadData.innerHTML += post.author + ': <br />' + post.message  + '<br /><br />'
            threadData.innerHTML += `<button id="` + post.postId + `"onClick="window.deletePost(` + post.postId + `)" type="button" class="btn btn btn-primary" >Delete</button>` + '<br /><br />'
          })
        })
      }

      const updateThreadCapabilities = () => {
        threadMemberList.innerHTML = ''
        if (window.currentThread._members) {
          window.currentThread.listMembers().then(members => {
            members.map(member => {
                threadMemberList.innerHTML += member + '<br />'
            })
          })
        }
        threadModeratorList.innerHTML = ''
        window.currentThread.listModerators().then(moderators => {
          moderators.map(moderator => {
              threadModeratorList.innerHTML += moderator  +  '<br />'
          })
        })
      }

      postThread.addEventListener('click', () => {
        window.currentThread.post(postMsg.value).catch(updateThreadError)
      })

      // Ghost Chat Start

      const updateChatCapabilities = (user) => {
        chatMemberList.innerHTML += user  +  '<br />'
      }

      const updateChatData = (data) => {
        chatData.innerHTML += data  +  '<br />'
      }

      joinChatBtn.addEventListener('click', async () => {
        console.log('joined chat')
        const name = 'example 3box dapp'
        const threeId = box._3id
        const ipfs = box._ipfs
        ipfs.swarm.connect('/ip4/127.0.0.1/tcp/4015/ws/ipfs/QmXGbAwcGmCFsMNMA5NHjz8r16WP9DHPLBf6RNEtN1kNji', console.log)
        // ipfs.swarm.peers(console.log)
        const chat = box.spaces[window.currentSpace].joinChat()
        window.currenChat = chat
        console.log(window.currenChat)

        messages.style.display = 'block'
        chatMembers.style.display = 'block'
        leaveChatBtn.style.display = 'block'
        chatMemberList.innerHTML = ''
        chatData.innerHTML = '';

        chat.on('user-joined', (did, peerID) => console.log(`${did} has joined the chat`))
        console.log('join event set');
        chat.on('user-left', (did, peerID) => console.log(`${did} has left the chat`))
        console.log('left event set');
        chat.on('message', ({ type, from, message }) => console.log(`${from} said: ${message}`))
        console.log('message event set');


      })

      // leaveChatBtn.addEventListener('click', async () => {
      //   await window.currenChat.leaveChat()
      //   messages.style.display = 'none'
      //   chatMembers.style.display = 'none'
      //   leaveChatBtn.style.display = 'none'
      //   chatMemberList.innerHTML = ''
      //   chatData.innerHTML = '';
      // })

      postChatBtn.addEventListener('click', async () => {
        await window.currenChat.post(messageField.value)
      })
      // Ghost Chat End

      bclose.addEventListener('click', () => {
        logout(box)
      })
    })
  })
})

getProfile.addEventListener('click', () => {
  console.log(ethAddr.value)
  window.Box.getProfile(ethAddr.value, {}).then(profile => {
    console.log(profile)
    Object.entries(profile).map(kv => {
      getProfileData.innerHTML += kv[0] + ': ' + kv[1] + '<br />'
    })
  })
})

profileGraphQL.addEventListener('click', () => {
  const query = profileGraphQLQuery.value
  console.log(query)
  window.Box.profileGraphQL(query).then(res => {
    console.log(res)
    profileGraphQLData.innerHTML = ''
    if (res.profile) {
      Object.entries(res.profile).map(kv => {
        profileGraphQLData.innerHTML +=kv[0] + ': ' + kv[1] + '<br />'
      })
    } else if (res.profiles) {
      res.profiles.map(profile => {
        Object.entries(profile).map(kv => {
          profileGraphQLData.innerHTML +=kv[0] + ': ' + kv[1] + '<br />'
        })
        profileGraphQLData.innerHTML += '<hr />'
      })
    }
  })
})

function updateProfileData(box) {
  box.public.all().then(profile => {
    console.log(profile)
    let tmpData = ''
    Object.entries(profile).map(kv => {
      tmpData += kv[0] + ': ' + kv[1] + '<br />'
    })
    profileData.innerHTML = tmpData
  })
  updateGithubUser(box)
}

function updatePrivateData (key, value) {
  privateStoreData.innerHTML = ''
  privateStoreData.innerHTML = key + ': ' + value
}

function logout (box) {
  box.logout().then(() => {
    privateStoreData.innerHTML = ''
    profileData.innerHTML = ''
    controlls.style.display = 'none'
  })
}

function updateGithubUser (box) {
  githubUser.innerHTML = ''
  box.verified.github().then(res => {
    console.log(res.username)
    githubUser.innerHTML = res.username
  }).catch(error => {
    githubUser.innerHTML = error
  })
}
