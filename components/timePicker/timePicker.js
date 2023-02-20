// components/timePicker/timePicker.js
import dateTimePicker from '../../utils/dateTimePicker.js';
Component({
  data: {
    date: '2018-10-01',
    time: '12:00',
    dateTimeArray: null,
    dateTime: null,
    dateTimeArray1: null,
    dateTime1: null,
    startYear: 2000,
    endYear: 2050,

  },

  properties: {
    endDate: {
      type: String
    },
  },

  ready() {
    let endDate = Number(this.data.endDate);

    let cTime = endDate? dateTimePicker.format(endDate,''):'';
    
    let obj1 = dateTimePicker.dateTimePicker(this.data.startYear, this.data.endYear, cTime);
    let lastArray = obj1.dateTimeArray.pop();
    let lastTime = obj1.dateTime.pop();

    this.setData({
      dateTimeArray1: obj1.dateTimeArray,
      dateTime1: obj1.dateTime
    });

  },
  methods: {
    changeDate(e) {
      this.setData({ date: e.detail.value });
    },
    changeTime(e) {
      this.setData({ time: e.detail.value });
    },
    changeDateTime(e) {
      this.setData({ dateTime: e.detail.value });
    },

    //确定的事件
    changeDateTime1(e) {
      let self = this;
      let cTime = self.data.dateTimeArray1[0][self.data.dateTime1[0]] + '-' + self.data.dateTimeArray1[1][self.data.dateTime1[1]] + '-' + self.data.dateTimeArray1[2][self.data.dateTime1[2]] + ' ' + self.data.dateTimeArray1[3][self.data.dateTime1[3]] + ':' + self.data.dateTimeArray1[4][self.data.dateTime1[4]] +':00' ;
      this.triggerEvent('getModifyTime', {
        dateTime1: cTime
      }, {});
      
    },

    changeDateTimeColumn(e) {
      let arr = this.data.dateTime, dateArr = this.data.dateTimeArray;

      arr[e.detail.column] = e.detail.value;
      dateArr[2] = dateTimePicker.getMonthDay(dateArr[0][arr[0]], dateArr[1][arr[1]]);

      this.setData({
        dateTimeArray: dateArr,
        dateTime: arr
      });
    },
    changeDateTimeColumn1(e) {
      let arr = this.data.dateTime1, dateArr = this.data.dateTimeArray1;
      arr[e.detail.column] = e.detail.value;
      dateArr[2] = dateTimePicker.getMonthDay(dateArr[0][arr[0]], dateArr[1][arr[1]]);
      this.setData({
        dateTimeArray1: dateArr,
        dateTime1: arr
      });
    }
  }
})





