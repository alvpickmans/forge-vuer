<template>
    <div class="inline" v-if="user">
        <a href="#" class="user-pop" v-on:mouseover="hover" v-on:mouseout="hoverOut">
        {{ main }}
        </a>
        <div class="user-popover" v-if="showPopup" transition="fade" v-on:mouseover="hoverInfo" v-on:mouseout="hoverOutInfo">
        <div class="user-popover--img" v-bind:style="{ backgroundImage: 'url('+user.profile.profile_image+')' }">
            <h3 class="img-inner">{{ user.name }}</h3>
        </div>
        <div class="col-md-12">
            <p>{{ user.username }}</p>
        </div>
        <div class="col-md-12" v-if="user.email">
            <p>{{ user.email }}</p>
        </div>
        </div>
    </div>
</template>

<script>
    export default {
        props: ['user', 'main'],
        data() {
            return {
                timer: '',
                isInInfo: false,
                showPopup: false,
            }
        },
        methods: {
            hover: () => {
                this.timer = setTimeout(() => this.showPopover(), 600)
            },
            hoverOut: () => {
                clearTimeout(this.timer);
                this.timer = setTimeout(() => {
                    if ( ! this.isInInfo) {
                        this.closePopover();
                    }
                }, 200);
            },
            hoverInfo: () => this.isInInfo = true,
            hoverOutInfo: () => {
                this.isInInfo = false;
                this.hoverOut()
            },
            showPopover: () => this.showPopup = true,
            closePopover: () => this.showPopup = false,
        }
    }
</script>

<style>
    .user-pop{
      color: inherit;
      text-decoration: none;
    }
    .user-pop:hover{
        text-decoration: none;
        color: inherit;
    }
    .user-popover{
            position: absolute;
            width: 200px;
            background: #fff;
            border: none;
            border-radius: 5px;
            box-shadow: 0 6px 6px rgba(16, 16, 16, 0.04), 0 6px 6px rgba(0, 0, 0, 0.05);
            z-index:999;
            text-align: left;
     }
     .user-popover--img{
      background: rgb(237, 27, 27);
      background-position: center !important;
      background-size: cover !important;
      height: 100px;
      width: 100%;
      padding: 12px;
      text-align:left;
      vertical-align: bottom;
    }
    .user-popover--inner{
      padding: 10px;
    }
    .img-inner{
      color:rgb(237, 27, 27);
      font-size: 17px;
    }
</style>